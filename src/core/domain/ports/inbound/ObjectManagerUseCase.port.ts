
export type ObjectUploadPayload = {
    originalname?: string;
    mimetype?: string;
    size?: number;
};

export interface IObjectManagerUseCase {

    ExecuteCreateObject(file: ObjectUploadPayload, objectType: string, userUuid: string): Promise<any>;
    
}