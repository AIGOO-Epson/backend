import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TestMiddleware implements NestMiddleware {
  async use(req, res: Response, next: NextFunction) {
    console.log(req);
    console.log(req.headers);
    console.log('req.body', req.body);
    console.log('req.formData', req.formData);
    console.log('req.files', req.files);
    console.log('req.file', req.file);
    next();
  }
}
