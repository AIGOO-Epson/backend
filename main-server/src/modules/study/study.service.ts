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
    const t = await this.translateService.genLearningSet(['안녕']);
    console.log(t);
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
    const generagedLearningSet: Map<string, LearningSet> =
      await this.translateService.genLearningSet(transforedKeywords);

    const pdfBuffer = await this.pdfService.generatePdf(generagedLearningSet);
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
