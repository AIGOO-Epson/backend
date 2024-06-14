import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ExReq } from '../../common/middleware/auth.middleware';
import { LetterRepository } from './repository/letter.repository';
import { Types } from 'mongoose';
import { NewLetterForm } from './dto/letter.dto';
import { UserRepository } from '../user/repository/user.repository';
import {
  UserRoleEnum,
  ValidationUserGroup,
} from '../user/repository/entity/user.entity';
import { UserService } from '../user/user.service';
import { validateOrReject } from 'class-validator';

@Injectable()
export class LetterService {
  private logger = new Logger(LetterService.name);
  constructor(
    private letterRepository: LetterRepository,
    private userService: UserService,
    private userRepository: UserRepository
  ) {}

  async sendLetter(req: ExReq, targetArtistId: number, title: string) {
    const targetUser = await this.userRepository.userOrm.findOneBy({
      id: targetArtistId,
    });

    if (!targetUser) {
      throw new NotFoundException('target user not found');
    }
    if (
      targetUser.role === UserRoleEnum.GENERAL &&
      req.user.role === UserRoleEnum.GENERAL
    ) {
      throw new BadRequestException('general cannot send letter to general');
    }

    //1차 디비저장 후
    const letterDocumetObjectId = new Types.ObjectId();

    const letterForm: NewLetterForm = {
      senderId: req.user.userId,
      receiver: targetUser,
      letterDocumentId: letterDocumetObjectId,
      title: title,
    };
    const newLetter = await this.letterRepository.createLetter(letterForm);
    console.log(newLetter);

    //스캔요청
    //reqScan()

    return { success: true };
  }

  generateLetterDocument() {
    //1.앱손에서 보내주는 스캔결과물을 받아서
    //2.클라우드에 업로드 후
    //3.translate서비스에 url과 format(확장자)를 넘기면
    //4.결과로 {originText, translatedText}가 오고, 한국어 문장에는
    //문장분석 실시한 후 (분석된 문장을 원본문장과 구별해서 저장해야하나?)
    //5.몽고디비에 저장하면 끝.
    //리턴은 필요없다.
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
    console.log(sentLetters);

    return { sentLetters };
  }

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
}
