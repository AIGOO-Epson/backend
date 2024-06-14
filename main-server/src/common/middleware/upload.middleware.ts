import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as multer from 'multer';

@Injectable()
export class UploadMiddleware implements NestMiddleware {
  private upload = multer({
    storage: multer.memoryStorage(),
  }).any();

  use(req: Request, res: Response, next: NextFunction) {
    this.upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: 'File upload error' });
      }
      next();
    });
  }
}
