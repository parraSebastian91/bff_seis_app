/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, HttpStatus, Inject, Post, Put, Req, Res, UploadedFile, UseFilters, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import type { File } from 'multer';
import type { IObjectManagerUseCase } from 'src/core/domain/ports/inbound/ObjectManagerUseCase.port';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import { ApiResponse } from '../model/api-response.model';
import { Roles } from '../decorators/roles.decorator';

@Controller("object")
@UseFilters(ErrorHandler)
export class ObjectManagerController {

    constructor(@Inject('OBJECT_MANAGER_USE_CASE') private readonly objectManagerUseCase: IObjectManagerUseCase) { }

    private async readRawBody(req: Request): Promise<Buffer> {
        if (Buffer.isBuffer(req.body)) {
            return req.body;
        }

        return await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];

            req.on('data', (chunk: Buffer | string) => {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            });

            req.on('end', () => resolve(Buffer.concat(chunks)));
            req.on('error', reject);
        });
    }

    @Post("/:objectType")
    @UseInterceptors(FileInterceptor('file'))
    async createObject(
        @UploadedFile() file: File,
        @Req() req: Request,
        @Res() response: Response
    ) {
        const userSession = req["user"];
        const { objectType } = req.params;

        const createdObject = await this.objectManagerUseCase.ExecuteCreateObject(file, objectType as string, userSession["userUuid"]);

        return response.status(201).json({
            message: "Objeto creado exitosamente",
            data: createdObject
        });
    }


    @Get("presigned-url/:objectType")
    @Roles("USR_STD")
    async getPresignedPutUrl(
        @Req() req: Request,
        @Res() resp: Response
    ) {
        const userSession = req["user"];
        const { objectType } = req.params;
        let { fileName, fileType } = req.query as { fileName: string, fileType: string };

        const rul = await this.objectManagerUseCase.ExecuteGetPresignedPutUrl(objectType as string, userSession["userUuid"], fileName, fileType);

        return resp.status(200).json(
            new ApiResponse(HttpStatus.OK, "Presigned URL obtenida exitosamente", {
                url: rul
            })
        )
    }

    @Put(':objectType')
    async updateObject(
        @Req() req: Request,
        @Res() response: Response
    ) {
        const userSession = req["user"];
        const { objectType } = req.params;

        const rawFile = await this.readRawBody(req);
        const filePayload = {
            originalname: (req.headers['x-file-name'] as string) || 'upload.bin',
            mimetype: (req.headers['content-type'] as string) || 'application/octet-stream',
            size: rawFile.length,
            buffer: rawFile,
        };

        const createdObject = await this.objectManagerUseCase.ExecuteUploadObject(filePayload, objectType as string, userSession["userUuid"]);

        return response.status(201).json({
            message: "Objeto subido exitosamente",
            data: createdObject
        });
    }
}
