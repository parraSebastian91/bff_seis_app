import { Catch, ExceptionFilter, ArgumentsHost, Logger, HttpStatus, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { TokenExpiredError } from "@nestjs/jwt";
import { Request, Response } from "express";
import { ProfileImageError } from "src/core/domain/errors/ProfileImage.error";

@Catch()
export class ErrorHandler implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>()

        let status = 500;
        let message = "Internal server error";

        if (exception instanceof UnauthorizedException) {
            Logger.warn(`UnauthorizedException: ${exception.message}`);
            status = HttpStatus.UNAUTHORIZED;
            message = exception.message;
        } else if (exception instanceof TokenExpiredError) {
            Logger.warn(`TokenExpiredError: ${exception.message}`);
            status = HttpStatus.UNAUTHORIZED;
            message = "Token expired";
        } else if (exception instanceof ProfileImageError) {
            Logger.warn(`ProfileImageError: ${exception.message}`);
            status = HttpStatus.FORBIDDEN;
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