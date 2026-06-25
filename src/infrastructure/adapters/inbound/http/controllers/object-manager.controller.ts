/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, HttpStatus, Inject, Post, Put, Req, Res, UploadedFile, UseFilters, UseInterceptors, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import type { File } from 'multer';
import type { IObjectManagerUseCase } from 'src/core/domain/ports/inbound/ObjectManagerUseCase.port';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import { ApiResponse } from '../model/api-response.model';
import { Roles } from '../decorators/roles.decorator';
import { CATEGORY_PROCESS } from 'src/core/domain/models/constantes.model';
import { ParameterNotFoundError } from 'src/core/domain/errors/ParameterNotFound.error';

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

    @Get(":assetId/presigned-url")
    @Roles("USR_STD")
    async getPresignedPutUrlByAssetId(
        @Req() req: Request,
        @Res() resp: Response,
        @Query('orgUuid') orgUuid: string
    ) {
        const userSession = req["user"];
        const { assetId } = req.params;
        const {url, ttlSeconds} = await this.objectManagerUseCase.ExecuteGetPresignedGetUrl(assetId as string, userSession["userUuid"], orgUuid, req["correlationId"]);
        return resp.status(200).json(
            new ApiResponse(HttpStatus.OK, "Presigned URL obtenida exitosamente", {
                url: url,
                ttlSeconds: ttlSeconds
            })
        );
    }

    /**
     * Devuelve el contenido del objeto como bytes — la URL de MinIO nunca sale del BFF.
     * El cliente recibe un blob que Angular convierte en un blob: URL local
     * (no compartible, no persistente, destruido al cerrar la pestaña).
     */
    @Get(":assetId/view")
    @Roles("USR_STD")
    async viewObject(
        @Req() req: Request,
        @Res() resp: Response,
        @Query('orgUuid') orgUuid: string,
    ) {
        const userSession = req["user"];
        const { assetId } = req.params;
        const { buffer, contentType } = await this.objectManagerUseCase.ExecuteStreamObject(
            assetId as string,
            userSession["userUuid"],
            orgUuid,
            req["correlationId"],
        );
        resp.setHeader('Content-Type', contentType);
        resp.setHeader('Content-Length', buffer.length);
        resp.setHeader('Cache-Control', 'private, no-store');       // no caching in browser
        resp.setHeader('X-Content-Type-Options', 'nosniff');
        resp.setHeader('Content-Disposition', 'inline');
        return resp.status(200).end(buffer);
    }


    @Get("presigned-url/:objectType")
    @Roles("USR_STD")
    async getPresignedPutUrl(
        @Req() req: Request,
        @Res() resp: Response
    ) {
        const userSession = req["user"];
        const { objectType } = req.params;
        let { fileName, fileType, userName, organization, idFactura } = req.query as { fileName: string, fileType: string, userName: string, organization?: string, idFactura?: string };
        if (!userName || userName === "") {
            throw new ParameterNotFoundError("El parámetro 'userName' es requerido");
        }
        switch (objectType) {
            case CATEGORY_PROCESS.DOCUMENT_DTE:
            case CATEGORY_PROCESS.DOCUMENT_DTE_RESPALDO:
            case CATEGORY_PROCESS.DOCUMENT_OC:
            case CATEGORY_PROCESS.DOCUMENT_GD:
            case CATEGORY_PROCESS.DCOUMENT_AE:
            case CATEGORY_PROCESS.DOCUMENT_EP:
            case CATEGORY_PROCESS.DOCUMENT_HIS:
                if (!organization) {
                    throw new ParameterNotFoundError("El parámetro 'organization' es requerido para el tipo de objeto 'documents respaldo'");
                }
                if (!idFactura) {
                    throw new ParameterNotFoundError("El parámetro 'idFactura' es requerido para el tipo de objeto 'documents respaldo'");
                }
                break;
        }
        const rul = await this.objectManagerUseCase.ExecuteGetPresignedPutUrl(objectType as string, userSession["userUuid"], fileName, fileType, userName, req["correlationId"], organization, idFactura);

        return resp.status(200).json(
            new ApiResponse(HttpStatus.OK, "Presigned URL obtenida exitosamente", {
                url: rul,
                following: req["correlationId"]
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
