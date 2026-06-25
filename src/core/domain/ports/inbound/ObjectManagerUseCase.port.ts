import { ObjectUploadPayload } from "./../../../../core/application/useCase/objectManager/command/uploadObject.command";


export interface IObjectManagerUseCase {

    ExecuteCreateObject(file: ObjectUploadPayload, objectType: string, userUuid: string): Promise<any>;
    ExecuteGetPresignedPutUrl(objectType: string, userUuid: string, fileName: string, fileType: string, userName: string, correlationId: string, organization?: string, idFactura?: string): Promise<string>;
    ExecuteGetPresignedGetUrl(assetId: string, userUuid: string, orgUuid: string, correlationId: string): Promise<{url: string, ttlSeconds: number}>;
    ExecuteUploadObject(file: ObjectUploadPayload, objectType: string, userUuid: string): Promise<any>;
    /** Descarga el objeto directamente desde MinIO y devuelve el buffer.
     *  La URL prefirmada nunca sale del servidor — el frontend recibe solo los bytes. */
    ExecuteStreamObject(assetId: string, userUuid: string, orgUuid: string, correlationId: string): Promise<{ buffer: Buffer; contentType: string }>;

}