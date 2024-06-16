import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as multer from 'multer';

@Injectable()
export class UploadMiddleware implements NestMiddleware {
  private upload = multer({
    storage: multer.memoryStorage(),
  }).any();

  use(req: Request, res: Response, next: NextFunction) {
    console.log('upload request received');
    console.log(req);
    this.upload(req, res, (err) => {
      console.log('im here');
      if (err) {
        console.log('File upload error');
        console.log(err);
        return res.status(400).json({ error: 'File upload error' });
      }
      next();
    });
  }
}
