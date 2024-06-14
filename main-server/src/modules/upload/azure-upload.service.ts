import { Injectable, OnModuleInit } from '@nestjs/common';
import { Environment } from '../../config/env/env.service';
import { BlobServiceClient } from '@azure/storage-blob';
import { Types } from 'mongoose';
import { PdfService } from './pdf.service';
import { UploadService } from './upload.module';

@Injectable()
export class AzureUploadService implements UploadService, OnModuleInit {
  private azureClient: BlobServiceClient;

  constructor(private pdfService: PdfService) {}

  onModuleInit() {
    this.azureClient = BlobServiceClient.fromConnectionString(
      Environment.get('AZURE_STORAGE_CONNECTION_STRING')
    );
  }

  async uploadLetter() {
    //스캔한 결과물의 url을 인풋으로 받음.
    //url이 아님. 스캔 예제보고
    //팬레터 사진 or pdf 업로드
    //LetterDocument_id/pagesArrayIndex.확장자 로 업로드
    //컨테이너는 암호화userId로 생성하고, 유저 귀속같은 취급
  }

  async uploadStudyData(
    userUuid: string,
    keywords: string[]
  ): Promise<{ fileUrl: string }> {
    const pdfBuffer = await this.pdfService.generatePdf(keywords);

    const tmpObjId = new Types.ObjectId().toString();
    const containerName = userUuid;

    const fileName = `${tmpObjId}.pdf`;
    console.log(tmpObjId, containerName);

    const containerClient = this.azureClient.getContainerClient(containerName);
    const exists = await containerClient.exists();
    if (!exists) {
      //access: 전역access 설정
      await containerClient.create({ access: 'container' });
    }

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.uploadData(pdfBuffer);

    return {
      fileUrl: `/${containerName}/${fileName}`,
      // fileUrl: `https://${this.azureClient.accountName}.blob.core.windows.net/${containerName}/${fileName}`,
    };
  }
  async uploadUserImg() {
    //버퍼를 인풋으로 받음
    //유저사진 업로드(사진 확장자)
    //objId.확장자로 컨테이너에 계층구조 없이 쌩으로 업로드
    //컨테이너는 암호화userId로 생성하고, 유저 귀속같은 취급
  }
}
