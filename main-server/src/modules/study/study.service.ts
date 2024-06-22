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

const sampleLearningSets: Map<string, LearningSet> = new Map([
  [
    '사랑',
    {
      translation: 'love',
      synonyms: '애정, 연애',
      antonyms: '미움, 증오',
      pronunciation: 'sa-rang',
      exercises: [
        '사랑의 반의어는 무엇인가요?',
        '사랑을 영어로 어떻게 표현하나요?',
        '사랑과 애정의 차이점을 설명해보세요.',
      ],
      caution:
        '사랑이라는 단어는 문맥에 따라 다양한 의미로 사용될 수 있습니다.',
    },
  ],
  [
    '행복',
    {
      translation: 'happiness',
      synonyms: '기쁨, 즐거움',
      antonyms: '슬픔, 불행',
      pronunciation: 'haeng-bok',
      exercises: [
        '행복의 유의어는 무엇인가요?',
        '행복을 영어로 어떻게 표현하나요?',
        '행복과 슬픔을 대조하여 설명해보세요.',
      ],
      caution: '행복의 기준은 사람마다 다를 수 있습니다.',
    },
  ],
  [
    '용기',
    {
      translation: 'courage',
      synonyms: '용맹, 담력',
      antonyms: '겁, 비겁',
      pronunciation: 'yong-gi',
      exercises: [
        '용기의 반의어는 무엇인가요?',
        '용기를 영어로 어떻게 표현하나요?',
        '용기와 비겁의 차이점을 설명해보세요.',
      ],
      caution: '용기는 무모함과 혼동될 수 있습니다.',
    },
  ],
  [
    '지혜',
    {
      translation: 'wisdom',
      synonyms: '지식, 슬기',
      antonyms: '무지, 어리석음',
      pronunciation: 'ji-hye',
      exercises: [
        '지혜의 유의어는 무엇인가요?',
        '지혜를 영어로 어떻게 표현하나요?',
        '지혜와 무지의 차이점을 설명해보세요.',
      ],
      caution: '지혜는 경험을 통해 얻어지는 경우가 많습니다.',
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
    // this.tst();
  }

  async tst() {
    const pdfBuffer = await this.pdfService.generatePdf(sampleLearningSets);
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
    const { fileUrl } = await this.uploadService.uploadFile(
      req.user.uuid,
      this.createPdfFileFromBuffer(pdfBuffer)
    );

    const studyForm: NewStudyForm = {
      keywords: transforedKeywords,
      title,
      url: fileUrl,
      owner: { id: req.user.userId },
      letterFrom: { id: letterId },
    };

    const newStudyData =
      await this.studyRepository.studyDataOrm.save(studyForm);

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
