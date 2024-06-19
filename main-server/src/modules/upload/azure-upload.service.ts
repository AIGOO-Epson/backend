import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { Environment } from '../../config/env/env.service';
import {
  BlobHTTPHeaders,
  BlobServiceClient,
  ContainerClient,
} from '@azure/storage-blob';
import { Types } from 'mongoose';
import { UploadService } from './upload.module';

@Injectable()
export class AzureUploadService implements UploadService, OnModuleInit {
  private azureClient: BlobServiceClient;

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
      const fileExtension = file.mimetype.split('/').pop();

      if (!fileExtension) {
        throw new InternalServerErrorException(
          'err while upload letter, mimeType missing'
        );
      }

      // Validate and get content type
      const contentType = this.getContentType(fileExtension);

      const fileName = `${tmpObjId}.${fileExtension}`;
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);

      const blobOptions = {
        blobHTTPHeaders: {
          blobContentType: contentType,
        } as BlobHTTPHeaders,
      };

      await blockBlobClient.uploadData(file.buffer, blobOptions);
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

    const containerClient: ContainerClient =
      this.azureClient.getContainerClient(containerName);
    const exists = await containerClient.exists();
    if (!exists) {
      //access: 전역access 설정
      await containerClient.create({ access: 'container' });
    }

    const blobOptions = {
      blobHTTPHeaders: {
        blobContentType: 'application/pdf',
      } as BlobHTTPHeaders,
    };

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.uploadData(pdfBuffer, blobOptions);

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

  private getContentType(ext: string): string {
    const extRegex = /^(pdf|jpeg|jpg|png)$/;
    if (!extRegex.test(ext)) {
      throw new Error('Unsupported file type');
    }
    return ext === 'pdf'
      ? 'application/pdf'
      : ext === 'jpeg' || ext === 'jpg'
        ? 'image/jpeg'
        : ext === 'png'
          ? 'image/png'
          : 'application/octet-stream';
  }
}
