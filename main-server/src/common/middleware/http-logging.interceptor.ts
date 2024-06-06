import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { parse } from 'url';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl, headers, connection, body } = req;
    const now = Date.now();
    const ipAddress = headers['x-forwarded-for'] || connection.remoteAddress;
    const parsedUrl = parse(originalUrl, true);

    //path logging
    this.logger.log(
      `${method} ${parsedUrl.pathname}: ${context.getClass().name} ${context.getHandler().name}`
    );

    //query params logging
    if (parsedUrl.query && Object.keys(parsedUrl.query).length > 0) {
      this.logger.debug(
        'Query parameters:',
        JSON.stringify(parsedUrl.query, null, 2)
      );
    }

    //body logging
    if (Object.keys(body).length > 0) {
      this.logger.debug('Request body:', JSON.stringify(body, null, 2));
    }

    return next.handle().pipe(
      tap((res) => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;

        //response logging
        this.logger.log(
          `req from ${ipAddress}, ${method} ${parsedUrl.pathname} ${statusCode}: ${Date.now() - now}ms`
        );
        this.logger.debug('Response:', JSON.stringify(res, null, 2));
      }),
      catchError((err) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode || err.status || 500;
        const errorMessage =
          err instanceof HttpException
            ? JSON.stringify(err.getResponse(), null, 2)
            : err.message;

        //error logging
        this.logger.error(
          `req from ${ipAddress}, ${method} ${parsedUrl.pathname} ${statusCode}: ${Date.now() - now}ms`
        );
        this.logger.error('Error:', errorMessage);

        return throwError(() => err);
      })
    );
  }
}
