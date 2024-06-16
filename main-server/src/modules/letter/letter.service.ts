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
import { LetterDocument } from './repository/schema/letter-document.schema';
import {
  PageKind,
  PicturePage,
  TextPage,
} from './repository/schema/page.schema';
import { Letter } from './repository/letter.entity';

@Injectable()
export class LetterService {
  private logger = new Logger(LetterService.name);
  constructor(
    private letterRepository: LetterRepository,
    private userService: UserService,
    private userRepository: UserRepository,
    @Inject('UploadService')
    private uploadService: UploadService,
    private translateService: TranslateService
  ) {}

  async sendLetter(
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

    //2 ocr, page 조립
    const pages: (PicturePage | TextPage)[] = await Promise.all(
      fileUrlList.map(async (url, index) => {
        const currentPageKind = pageTypes[index];

        if (currentPageKind === PageKind.PICTURE) {
          return { url, type: PageKind.PICTURE };
        }

        // const { originText, translatedText } = await this.translateService.run(fileUrl);
        const { originText, translatedText } = {
          originText: ['aa', 'bb'],
          translatedText: ['안녕하세요.', '커피입니다.'],
        };

        return {
          url,
          originText,
          translatedText,
          type: PageKind.TEXT,
        };
      })
    );

    //3 한국어분석
    //4 저장
    //save to pg
    const letterDocumentId = new Types.ObjectId();
    const letterForm: NewLetterForm = {
      senderId: req.user.userId,
      receiver: targetUser,
      letterDocumentId,
      title,
    };
    const newLetter = await this.letterRepository.createLetter(letterForm);

    //save to mongo
    const newLetterDocument = new this.letterRepository.letterModel({
      _id: letterDocumentId,
      letterId: newLetter.id,
      pages,
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
      letter.sender,
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
}
