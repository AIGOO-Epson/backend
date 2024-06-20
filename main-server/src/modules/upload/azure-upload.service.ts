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

  async uploadFiles(
    userUuid: string,
    files: Express.Multer.File[]
  ): Promise<{ fileUrlList: string[] }> {
    const containerName = userUuid;

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

      const fileName = `${tmpObjId}.${fileExtension}`;
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);

      const blobOptions = {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        } as BlobHTTPHeaders,
      };

      await blockBlobClient.uploadData(file.buffer, blobOptions);
      return `/${containerName}/${fileName}`;
    });

    const fileUrlList = await Promise.all(uploadPromises);

    return { fileUrlList };
  }

  async uploadFile(
    userUuid: string,
    file: Express.Multer.File
  ): Promise<{ fileUrl: string }> {
    const tmpObjId = new Types.ObjectId().toString();
    const containerName = userUuid;
    const fileExtension = file.mimetype.split('/').pop();
    if (!fileExtension) {
      throw new InternalServerErrorException(
        'err while upload user img, mimeType missing'
      );
    }

    const containerClient: ContainerClient =
      this.azureClient.getContainerClient(containerName);
    const exists = await containerClient.exists();
    if (!exists) {
      //access: 전역access 설정
      await containerClient.create({ access: 'container' });
    }

    const fileName = `${tmpObjId}.${fileExtension}`;
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    const blobOptions = {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      } as BlobHTTPHeaders,
    };

    await blockBlobClient.uploadData(file.buffer, blobOptions);
    return { fileUrl: `/${containerName}/${fileName}` };
  }
}
