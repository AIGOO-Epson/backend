import { Module } from '@nestjs/common';
import { LocalUploadService } from './local-upload.service';
import { AzureUploadService } from './azure-upload.service';

export interface UploadService {
  uploadLetter(
    uuid: string,
    files: Express.Multer.File[]
  ): Promise<{ fileUrlList: string[] }>;
  uploadStudyData(
    userUuid: string,
    pdfBuffer: Buffer
  ): Promise<{ fileUrl: string }>;
  uploadUserImg(): void;
}

const selectUploadServiceType = () => {
  const NODE_ENV = process.env.NODE_ENV;

  // if (NODE_ENV === 'development' || NODE_ENV === 'local') {
  // return LocalUploadService;
  // }
  return AzureUploadService;
};

const uploadService = {
  provide: 'UploadService',
  useClass: selectUploadServiceType(),
};

@Module({
  providers: [uploadService, LocalUploadService],
  exports: [uploadService, LocalUploadService],
})
export class UploadModule {}
