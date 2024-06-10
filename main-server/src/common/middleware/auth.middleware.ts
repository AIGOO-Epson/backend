import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService, JwtPayload } from '../../modules/auth/auth.service';

export interface ExReq extends Request {
  user: JwtPayload;
}

//https://docs.nestjs.com/middleware
//app.module.ts에 전역으로 설치했음.
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private logger = new Logger(AuthMiddleware.name);
  constructor(private authService: AuthService) {}

  async use(req: ExReq, res: Response, next: NextFunction) {
    const jwtPayload = await this.authService.certificateJWT(req, res);
    req.user = jwtPayload;
    next();
  }
}
