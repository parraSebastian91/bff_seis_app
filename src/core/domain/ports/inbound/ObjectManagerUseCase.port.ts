import { ObjectUploadPayload } from "./../../../../core/application/useCase/objectManager/command/uploadObject.command";


export interface IObjectManagerUseCase {

    ExecuteCreateObject(file: ObjectUploadPayload, objectType: string, userUuid: string): Promise<any>;
    ExecuteGetPresignedPutUrl(objectType: string, userUuid: string, fileName: string, fileType: string, userName: string, organization?: string): Promise<string>;
    ExecuteUploadObject(file: ObjectUploadPayload, objectType: string, userUuid: string): Promise<any>;
    
}