import { Catch, ExceptionFilter, ArgumentsHost, Logger, HttpStatus, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class ErrorHandler implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>()

        let status = 500;
        let message = "Internal server error";

        if(exception instanceof UnauthorizedException) {
            Logger.warn(`UnauthorizedException: ${exception.message}`);
            status = HttpStatus.UNAUTHORIZED;
            message = exception.message;
        }
        else {
            Logger.error(`Unexpected error: ${exception.message}`, exception.stack);
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = "Internal server error";
        }

        response
            .status(status)
            .json({
                status: status,
                message: message
            });
    }
}