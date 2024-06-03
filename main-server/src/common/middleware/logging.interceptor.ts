import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const { method, path: url, headers, connection, body } = req;
    const now = Date.now();
    const ipAddress = headers['x-forwarded-for'] || connection.remoteAddress;
    this.logger.log(
      `${method} ${url}: ${context.getClass().name} ${
        context.getHandler().name
      }`
    );

    Object.keys(body).length > 0 &&
      this.logger.debug('Request body:', JSON.stringify(body, null, 2));

    return next.handle().pipe(
      tap((res) => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;

        this.logger.log(
          `req from ${ipAddress}, ${method} ${url} ${statusCode}: ${Date.now() - now}ms`
        );
        this.logger.debug('Response:', JSON.stringify(res, null, 2));
      })
    );
  }
}

// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
//   Logger,
// } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { tap } from 'rxjs/operators';

// @Injectable()
// export class LoggingInterceptor implements NestInterceptor {
//   private readonly logger = new Logger(LoggingInterceptor.name);

//   intercept(
//     context: ExecutionContext,
//     next: CallHandler,
//   ): Observable<any> | Promise<Observable<any>> {
//     const req = context.switchToHttp().getRequest();
//     const userAgent = req.get('user-agent') || '';
//     const { ip, method, path: url } = req;
//     const now = Date.now();

//     this.logger.log(
//       `${method} ${url} ${userAgent} ${ip}: ${context.getClass().name} ${
//         context.getHandler().name
//       }`,
//     );

//     return next.handle().pipe(
//       tap((res) => {
//         const response = context.switchToHttp().getResponse();
//         const { statusCode } = response;
//         this.logger.log(
//           `${method} ${url} ${statusCode}: ${Date.now() - now}ms`,
//         );

//         this.logger.debug('Response:', res);
//       }),
//     );
//   }
// }
