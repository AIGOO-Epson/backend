import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ExReq } from '../../common/middleware/auth.middleware';
import { LetterRepository } from './repository/letter.repository';
import { Types } from 'mongoose';
import { NewLetterForm } from './dto/letter.dto';
import { UserRepository } from '../user/repository/user.repository';
import {
  User,
  UserRoleEnum,
  ValidationUserGroup,
} from '../user/repository/entity/user.entity';
import { UserService } from '../user/user.service';
import { validateOrReject } from 'class-validator';
import { UploadService } from '../upload/upload.module';
import { TranslateService } from '../translate/translate.service';
import {
  LetterDocument,
  LetterDocumentStatus,
} from './repository/schema/letter-document.schema';
import {
  PageKind,
  PicturePage,
  TextPage,
} from './repository/schema/page.schema';
import { Letter } from './repository/letter.entity';
import { KoreanAnalyzeService } from '../korean-analyze/korean-analyze.service';
import { LocalUploadService } from '../upload/local-upload.service';
import { EpsonService } from '../epson/epson.service';

@Injectable()
export class LetterService {
  private logger = new Logger(LetterService.name);
  constructor(
    private letterRepository: LetterRepository,
    private userService: UserService,
    private userRepository: UserRepository,
    @Inject('UploadService')
    private uploadService: UploadService,
    private translateService: TranslateService,
    private koreanAnalyzeService: KoreanAnalyzeService,
    private localUploadService: LocalUploadService,
    private epsonService: EpsonService
  ) {}

  //로컬 수동테스트 flow
  //1 sendLetterByScan을 api 엔드포인트로 접근해서 수행
  //2 pgdb에 삽입 확인, 몽고에 삽입확인 하는데 pending인지까지 체크
  //3 스캔결과받는 엔드포인트로 uuid랑 몽고 objid를 파라미터로 해서 파일 전송
  //4 몽고디비 제대로 업데이트 되는지 확인. status가 success 되는지,
  //번역이랑 분석은 잘 됐는지.

  //실제 스캐너 수동테스트 flow
  //주석처리 해놓은 스캔destination 메서드를 주석풀고 실제로
  //앱손 api까지 테스트.
  async sendLetterByScan(req: ExReq, targetArtistId: number, title: string) {
    if (req.user.epsonDevice === null) {
      throw new BadRequestException('epson device is null');
    }
    const targetUser = this.throwExeptionIfCannotSend(
      req.user,
      await this.userRepository.userOrm.findOneBy({
        id: targetArtistId,
      }),
      [],
      []
    );

    //3 저장
    //3-1 save to pg
    const letterDocumentId = new Types.ObjectId();
    const letterForm: NewLetterForm = {
      senderId: req.user.userId,
      receiver: targetUser,
      letterDocumentId,
      title,
    };
    const newLetter = await this.letterRepository.createLetter(letterForm);

    //3-2 save to mongo
    const newLetterDocument = new this.letterRepository.letterModel({
      _id: letterDocumentId,
      letterId: newLetter.id,
      pages: [],
      status: LetterDocumentStatus.PENDING,
    });
    //TODO 타이머 돌려서 failed로
    await newLetterDocument.save();

    //TODO 수동테스트 위해 주석처리
    // await this.epsonService.setScanDestination(
    //   req.user.epsonDevice,
    //   req.user.uuid,
    //   letterDocumentId
    // );
    console.log(req.user.epsonDevice, req.user.uuid, letterDocumentId);

    //이제 스캐너에서 스캔 보내라는 뜻.
    return { success: true };
  }

  async processScanReslt(
    data: {
      uuid: string;
      letterDocumentId: string;
    },
    files: Express.Multer.File[]
  ) {
    const letterDocument = await this.letterRepository.letterModel.findById(
      data.letterDocumentId
    );

    if (
      letterDocument === null ||
      letterDocument.status !== LetterDocumentStatus.PENDING
    ) {
      //이미 처리완료인 레터이거나, 실패한 레터면 처리안함.
      return;
    }

    //1 업로드
    const { fileUrlList } = await this.uploadService.uploadLetter(
      data.uuid,
      files
    );

    //2 page 조립
    const letterPages: (PicturePage | TextPage)[] = await Promise.all(
      fileUrlList.map(async (url) => {
        //2-1 OCR, 번역
        const ocrAndTranslateResult = await this.translateService.run(
          'https://aigooback.blob.core.windows.net' + url
        );

        //TODO OCR, 번역으로 글자없는 사진이 들어갔을때 빈 리스트를 리턴받을 수 있나?
        //TODO 그럼 여기다가 그냥 type은 PICTURE로 해서 리턴 추가.
        //TODO 일단은 그냥 전부 글자들어간 팬레터라고 가정.

        //2-2 한국어분석
        const analyzedKoreanResult =
          await this.koreanAnalyzeService.analyzeKoreanText(
            ocrAndTranslateResult
          );

        return {
          url,
          type: PageKind.TEXT,
          ...analyzedKoreanResult,
        };
      })
    );
    letterDocument.pages = letterPages;
    letterDocument.status = LetterDocumentStatus.SUCCESS;
    await letterDocument.save();

    return;
  }

  async sendLetterByUpload(
    req: ExReq,
    targetArtistId: number,
    title: string,
    pageTypes: PageKind[],
    files: Express.Multer.File[]
  ) {
    const targetUser = this.throwExeptionIfCannotSend(
      req.user,
      await this.userRepository.userOrm.findOneBy({
        id: targetArtistId,
      }),
      pageTypes,
      files
    );

    //1 업로드
    const { fileUrlList } = await this.uploadService.uploadLetter(
      req.user.uuid,
      files
    );

    //2 page 조립
    const letterPages: (PicturePage | TextPage)[] = await Promise.all(
      fileUrlList.map(async (url, index) => {
        const currentPageKind = pageTypes[index];

        if (currentPageKind === PageKind.PICTURE) {
          return { url, type: PageKind.PICTURE };
        }

        //2-1 OCR, 번역
        const ocrAndTranslateResult = await this.translateService.run(
          'https://aigooback.blob.core.windows.net' + url
        );

        //2-2 한국어분석
        const analyzedKoreanResult =
          await this.koreanAnalyzeService.analyzeKoreanText(
            ocrAndTranslateResult
          );

        return {
          url,
          type: PageKind.TEXT,
          ...analyzedKoreanResult,
        };
      })
    );

    //3 저장
    //3-1 save to pg
    const letterDocumentId = new Types.ObjectId();
    const letterForm: NewLetterForm = {
      senderId: req.user.userId,
      receiver: targetUser,
      letterDocumentId,
      title,
    };
    const newLetter = await this.letterRepository.createLetter(letterForm);

    //3-2 save to mongo
    const newLetterDocument = new this.letterRepository.letterModel({
      _id: letterDocumentId,
      letterId: newLetter.id,
      pages: letterPages,
    });
    await newLetterDocument.save();

    return { success: true, letterDocumentId };
  }

  private throwExeptionIfCannotSend(
    reqUser,
    targetUser: User | null,
    pageTypes: PageKind[],
    files: Express.Multer.File[]
  ): User {
    if (!targetUser) {
      throw new NotFoundException('target user not found');
    }
    if (targetUser.id === reqUser.userId) {
      throw new BadRequestException('cannot send letter to u');
    }
    if (
      targetUser.role === UserRoleEnum.GENERAL &&
      reqUser.role === UserRoleEnum.GENERAL
    ) {
      throw new BadRequestException('general cannot send letter to general');
    }
    if (pageTypes.length !== files.length) {
      throw new BadRequestException(
        'pageTypes.length and files.length are not equal'
      );
    }
    return targetUser;
  }

  async getSentLetters(req: ExReq) {
    const sentLetters = await this.letterRepository.letterOrm.find({
      where: { sender: { id: req.user.userId } },
      order: { createdAt: 'DESC' },
      relations: ['receiver'],
    });

    //중요정보 삭제
    for (const letter of sentLetters) {
      if (letter.receiver) {
        //receiver can null
        letter.receiver = await this.userService.validateAndExposeUser(
          letter.receiver,
          [ValidationUserGroup.GET_USER]
        );
      }
      //이미 할당한 변수 변경하는게 좀 걸리지만,
      //그냥 이렇게 하면 letter의 inetanceof를 유지시킬수 있음. 테스트 용이
      //구조분해하면 instanceof 날라가고, plainToInstance로 만들수는 있겠는데
      //더러워짐
    }

    //validate
    await Promise.all(
      sentLetters.map(async (letter) => {
        await validateOrReject(letter).catch((error) => {
          this.logger.error(error);
        });
      })
    );

    return { sentLetters };
  }

  //TODO 나중에 고도화 한다면, 내가 팔로우하는 artist가 publish한 레터도 가져와야함.
  async getReceivedLetters(req: ExReq) {
    const receivedLetters = await this.letterRepository.letterOrm.find({
      where: { receiver: { id: req.user.userId } },
      order: { createdAt: 'DESC' },
      relations: ['sender'],
    });

    //중요정보 삭제
    for (const letter of receivedLetters) {
      letter.sender = await this.userService.validateAndExposeUser(
        letter.sender,
        [ValidationUserGroup.GET_USER]
      );
    }

    //validate
    await Promise.all(
      receivedLetters.map(async (letter) => {
        await validateOrReject(letter).catch((error) => {
          this.logger.error(error);
        });
      })
    );

    return { receivedLetters };
  }

  async getLetter(userId: number, letterDocumentId: string) {
    const { letter, letterDocument } = await this.checkValidGetLetterRequest(
      userId,
      letterDocumentId
    );

    //중요정보 삭제
    letter.sender = await this.userService.validateAndExposeUser(
      letter.sender,
      [ValidationUserGroup.GET_USER]
    );
    letter.receiver = await this.userService.validateAndExposeUser(
      letter.receiver,
      [ValidationUserGroup.GET_USER]
    );

    //validate
    await validateOrReject(letter).catch((error) => {
      this.logger.error(error);
    });

    return { letter, letterDocument };
  }

  /**objectId가 잘못됐거나, 편지가 없거나, 내 편지가 아니거나 체크 */
  private async checkValidGetLetterRequest(
    userId: number,
    letterDocumentId: string
  ): Promise<{
    letter: Letter;
    letterDocument: LetterDocument;
  }> {
    if (!Types.ObjectId.isValid(letterDocumentId)) {
      throw new BadRequestException('invalid document id');
    }
    const letterDocument = await this.letterRepository.letterModel.findOne({
      _id: letterDocumentId,
    });
    if (!letterDocument) {
      throw new NotFoundException('letter not found');
    }
    const letter = await this.letterRepository.letterOrm.findOne({
      where: { id: letterDocument?.letterId },
      relations: ['sender', 'receiver'],
    });
    if (!letter) {
      throw new NotFoundException('letter not found');
    }
    if (!(letter.receiver.id === userId || letter.sender.id === userId)) {
      throw new UnauthorizedException(
        'access denined, u cannot view this letter'
      );
    }
    return { letter, letterDocument };
  }

  async mockSendLetter(
    req: ExReq,
    targetArtistId: number,
    title: string,
    pageTypes: PageKind[],
    files: Express.Multer.File[]
  ) {
    const targetUser = this.throwExeptionIfCannotSend(
      req.user,
      await this.userRepository.userOrm.findOneBy({
        id: targetArtistId,
      }),
      pageTypes,
      files
    );

    //1 업로드
    const { fileUrlList } = await this.localUploadService.uploadLetter(
      req.user.uuid,
      files
    );

    //2 page 조립
    const letterPages: (PicturePage | TextPage)[] = await Promise.all(
      fileUrlList.map(async (url, index) => {
        const currentPageKind = pageTypes[index];

        if (currentPageKind === PageKind.PICTURE) {
          return { url, type: PageKind.PICTURE };
        }

        //2-1 OCR, 번역
        // const ocrAndTranslateResult = await this.translateService.run(
        // 'https://aigooback.blob.core.windows.net' + url
        // );
        const ocrAndTranslateResult = {
          originText: ['aa', 'bb'],
          translatedText: ['안녕하세요.', '커피입니다.'],
        };

        //2-2 한국어분석
        // const analyzedKoreanResult =
        //   await this.koreanAnalyzeService.analyzeKoreanText(
        //     ocrAndTranslateResult
        //   );

        return {
          url,
          type: PageKind.TEXT,
          ...ocrAndTranslateResult,
        };
      })
    );

    //3 저장
    //3-1 save to pg
    const letterDocumentId = new Types.ObjectId();
    const letterForm: NewLetterForm = {
      senderId: req.user.userId,
      receiver: targetUser,
      letterDocumentId,
      title,
    };
    const newLetter = await this.letterRepository.createLetter(letterForm);

    //3-2 save to mongo
    const newLetterDocument = new this.letterRepository.letterModel({
      _id: letterDocumentId,
      letterId: newLetter.id,
      pages: letterPages,
    });
    await newLetterDocument.save();

    return { success: true, letterDocumentId };
  }
}

export const mergeArrays = (
  original: string[],
  modified: string[]
): string[] => {
  const result: string[] = [];
  const modifiedIndex = { value: 0 };

  for (const originalSentence of original) {
    let temp = '';

    while (
      modifiedIndex.value < modified.length &&
      temp.length < originalSentence.length
    ) {
      if (temp.length > 0) {
        temp += ' ';
      }
      temp += modified[modifiedIndex.value];
      modifiedIndex.value++;
    }

    result.push(temp.trim());
  }

  console.log(result);

  return result;
};
