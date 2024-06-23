import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StudyRepository } from './repository/study.repository';
import { TranslateService } from '../translate/translate.service';
import { CreateStudyDto, NewStudyForm } from './dto/study.dto';
import { UploadService } from '../upload/upload.module';
import { ExReq } from '../../common/middleware/auth.middleware';
import { validateOrReject } from 'class-validator';
import { instanceToInstance } from 'class-transformer';
import { LearningSet } from '../translate/translate.definition';
import { PdfService } from './pdf.service';
import { LetterRepository } from '../letter/repository/letter.repository';
import { Readable } from 'stream';

const sample = new Map([
  [
    '달리다',
    {
      translation: 'to run, to jpg, to dash',
      synonyms: '뛰다, 질주하다',
      antonyms: '걷다 (to walk), 서다(to stand)',
      pronunciation: '/so.baŋ.gwan/',
      exercises: [
        'Describe the job of a firefighter. (소방관의 직업을 설명하세요.)',
        "Write a sentence using '소방관' to describe someone who puts out fires. ('소방관'을 사용하여 불을 끄는 사람을 설명하는 문장을 작성하세요.)",
      ],
      caution:
        "'소방관' is the most common and formal term for 'firefighter' in Korean.'소방관' is the most common and formal term for 'firefighter' in Korean.",
    },
  ],
]);

@Injectable()
export class StudyService {
  constructor(
    private studyRepository: StudyRepository,
    private translateService: TranslateService,
    @Inject('UploadService')
    private uploadService: UploadService,
    private pdfService: PdfService,
    private letterRepository: LetterRepository
  ) {
    // this.createStudy(
    //   {
    //     user: {
    //       userId: 1,
    //       uuid: '9aecbccc-953a-4278-ba64-1e4bffa71544',
    //     },
    //   } as ExReq,
    //   {
    //     letterId: 1,
    //     keywords: ['달리는', '고양이', '오늘'],
    //     title: 'testt',
    //   }
    // );
  }

  async tst() {
    const pdfBuffer = await this.pdfService.generatePdf(sample);
    await this.uploadService.uploadFile(
      ' tttt',
      this.createPdfFileFromBuffer(pdfBuffer)
    );
  }

  async readOne(userId: number, studyId: number) {
    const studyData = await this.studyRepository.studyDataOrm.findOne({
      where: { id: studyId },
      relations: ['owner'],
    });

    if (!studyData || studyData.owner.id !== userId) {
      throw new NotFoundException(
        'not found studyData or ur not owner of this'
      );
    }

    const transformedStudyData = instanceToInstance(studyData, {
      excludeExtraneousValues: true,
    });
    await validateOrReject(transformedStudyData).catch(() => {
      throw new InternalServerErrorException(
        'validation Err while validate studydata'
      );
    });

    return transformedStudyData;
  }

  async readMany(userId: number) {
    const studyDatas = await this.studyRepository.studyDataOrm.find({
      where: { owner: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    if (!studyDatas || studyDatas.length === 0) {
      return [];
    }

    const transforedStudyDatas = await Promise.all(
      studyDatas.map(async (studyData) => {
        const transformedStudyData = instanceToInstance(studyData, {
          excludeExtraneousValues: true,
        });
        await validateOrReject(transformedStudyData).catch(() => {
          throw new InternalServerErrorException(
            'validation Err while validate studydata'
          );
        });
        return transformedStudyData;
      })
    );

    return { studyDatas: transforedStudyDatas };
  }

  //TODO letterFrom이 내 소유가 아니라면?
  //TODO keywords가 한국어인지 체크해야함. 기본형으로 바꿔주는 로직은 한국어만 허용함.
  //TODO input dto validation에 로직 추가하면 될듯? 애초에 요청부터 막아야하니까
  async createStudy(req: ExReq, createStudyDto: CreateStudyDto) {
    const { keywords, letterId, title } = createStudyDto;

    const letter = await this.letterRepository.letterOrm.findOneBy({
      id: letterId,
    });

    if (!letter) {
      throw new NotFoundException('letter not found');
    }

    //1 기본형 전환
    const transforedKeywords =
      await this.translateService.getPrincipalParts(keywords);

    //2 학습자료 생성 요청
    const generatedLearningSet: Map<string, LearningSet> =
      await this.translateService.genLearningSet(transforedKeywords);

    const pdfBuffer = await this.pdfService.generatePdf(generatedLearningSet);
    console.log(1);
    const { fileUrl } = await this.uploadService.uploadFile(
      req.user.uuid,
      this.createPdfFileFromBuffer(pdfBuffer)
    );
    console.log(2);

    const studyForm: NewStudyForm = {
      keywords: transforedKeywords,
      title,
      url: fileUrl,
      owner: { id: req.user.userId },
      letterFrom: { id: letterId },
    };

    const newStudyData =
      await this.studyRepository.studyDataOrm.save(studyForm);
    console.log(3);

    return { studyData: newStudyData };
  }

  private createPdfFileFromBuffer(buffer: Buffer): Express.Multer.File {
    return {
      buffer: buffer,
      originalname: 'file.pdf',
      encoding: '7bit',
      fieldname: 'file',
      mimetype: 'application/pdf',
      destination: '',
      filename: '',
      path: '',
      size: buffer.length,
      stream: new Readable(),
    };
  }
}
