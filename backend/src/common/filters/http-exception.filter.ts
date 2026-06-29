import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as any).message || exception.message;
    } else if (exception instanceof Error) {
      // Mongoose duplicate key
      if ((exception as any).code === 11000) {
        status = HttpStatus.CONFLICT;
        const field = Object.keys((exception as any).keyValue || {})[0];
        message = `${field || 'Value'} already exists`;
      } else {
        console.error(exception);
      }
    }

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
