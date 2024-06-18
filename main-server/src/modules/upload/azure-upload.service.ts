import { Injectable, OnModuleInit } from '@nestjs/common';
import { Environment } from '../../config/env/env.service';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
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

  async uploadLetter(
    uuid: string,
    files: Express.Multer.File[]
  ): Promise<{ fileUrlList: string[] }> {
    const containerName = uuid;

    const containerClient: ContainerClient =
      this.azureClient.getContainerClient(containerName);
    const exists = await containerClient.exists();
    if (!exists) {
      // access: 전역 access 설정
      await containerClient.create({ access: 'container' });
    }

    const uploadPromises = files.map(async (file) => {
      const tmpObjId = new Types.ObjectId().toString();
      const fileName = `${tmpObjId}.${file.mimetype.split('/').pop()}`;
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      await blockBlobClient.uploadData(file.buffer);
      return `/${containerName}/${fileName}`;
    });

    const fileUrlList = await Promise.all(uploadPromises);

    return { fileUrlList };
  }

  async uploadStudyData(
    userUuid: string,
    pdfBuffer: Buffer
  ): Promise<{ fileUrl: string }> {
    const tmpObjId = new Types.ObjectId().toString();
    const containerName = userUuid;

    const fileName = `${tmpObjId}.pdf`;
    console.log(tmpObjId, containerName);

    const containerClient: ContainerClient =
      this.azureClient.getContainerClient(containerName);
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
