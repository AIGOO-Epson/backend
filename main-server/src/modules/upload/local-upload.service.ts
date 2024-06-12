import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Types } from 'mongoose';
import { promisify } from 'util';
import { PdfService } from './pdf.service';
import * as path from 'path';
import { UploadService } from './upload.module';

@Injectable()
export class LocalUploadService implements UploadService {
  private readonly basePath = path.resolve(process.cwd(), 'src', 'files');
  private readonly mkdir = promisify(fs.mkdir);
  private readonly writeFile = promisify(fs.writeFile);

  constructor(private pdfService: PdfService) {}

  async uploadLetter() {
    //스캔한 결과물의 url을 인풋으로 받음.
    //팬레터 사진 or pdf 업로드
    //LetterDocument_id/pagesArrayIndex.확장자 로 업로드
    //컨테이너는 암호화userId로 생성하고, 유저 귀속같은 취급
  }

  //TODO 추후 테스트하기 쉽게 기능분리
  async uploadStudyData(
    userUuid: string,
    keywords: string[]
  ): Promise<{ fileUrl: string }> {
    const pdfBuffer = await this.pdfService.generatePdf(keywords);

    const tmpObjId = new Types.ObjectId().toString();
    const containerName = userUuid;

    const userFolderPath = path.join(this.basePath, containerName);
    const filePath = path.join(userFolderPath, `${tmpObjId}.pdf`);

    await this.mkdir(userFolderPath, { recursive: true });
    await this.writeFile(filePath, pdfBuffer);

    return { fileUrl: `/${containerName}/${tmpObjId}.pdf` };
  }

  async uploadUserImg() {
    //버퍼를 인풋으로 받음
    //유저사진 업로드(사진 확장자)
    //objId.확장자로 컨테이너에 계층구조 없이 쌩으로 업로드
    //컨테이너는 암호화userId로 생성하고, 유저 귀속같은 취급
  }
}
