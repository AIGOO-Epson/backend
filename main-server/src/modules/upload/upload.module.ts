import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { LocalUploadService } from './local-upload.service';
import { AzureUploadService } from './azure-upload.service';

export interface UploadService {
  uploadLetter(): void;
  uploadStudyData(
    userUuid: string,
    keywords: string[]
  ): Promise<{ fileUrl: string }>;
  uploadUserImg(): void;
}

const selectUploadServiceType = () => {
  const NODE_ENV = process.env.NODE_ENV;

  if (NODE_ENV === 'development' || NODE_ENV === 'local') {
    return LocalUploadService;
  }
  return AzureUploadService;
};

const uploadService = {
  provide: 'UploadService',
  useClass: selectUploadServiceType(),
};

@Module({
  providers: [uploadService, PdfService],
  exports: [uploadService],
})
export class UploadModule {}
