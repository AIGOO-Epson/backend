import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Types } from 'mongoose';
import { promisify } from 'util';
import * as path from 'path';
import { UploadService } from './upload.module';

@Injectable()
export class LocalUploadService implements UploadService {
  private readonly basePath = path.resolve(process.cwd(), 'src', 'files');
  private readonly mkdir = promisify(fs.mkdir);
  private readonly writeFile = promisify(fs.writeFile);

  async uploadFiles(
    userUuid: string,
    files: Express.Multer.File[]
  ): Promise<{ fileUrlList: string[] }> {
    const fileUrlList = await Promise.all(
      files.map(async (file) => {
        const tmpObjId = new Types.ObjectId();
        const userFolderPath = path.join(this.basePath, userUuid);
        const fileName = `${tmpObjId.toString()}.${file.mimetype.split('/').pop()}`;
        const fileUrl = `/${userUuid}/${fileName}`;

        await this.mkdir(userFolderPath, { recursive: true });
        await this.writeFile(path.join(this.basePath, fileUrl), file.buffer);
        return `/${userUuid}/${tmpObjId.toString()}.${file.mimetype.split('/').pop()}`;
      })
    );

    return {
      fileUrlList,
    };
  }

  async uploadFile(
    userUuid: string,
    file: Express.Multer.File
  ): Promise<{ fileUrl: string }> {
    const tmpObjId = new Types.ObjectId();
    const containerName = userUuid;

    const userFolderPath = path.join(this.basePath, containerName);
    const fileName = `${tmpObjId.toString()}.${file.mimetype.split('/').pop()}`;
    const fileUrl = `/${userUuid}/${fileName}`;

    await this.mkdir(userFolderPath, { recursive: true });
    await this.writeFile(path.join(this.basePath, fileUrl), file.buffer);

    return {
      fileUrl: `/${userUuid}/${tmpObjId.toString()}.${file.mimetype.split('/').pop()}`,
    };
  }
}
