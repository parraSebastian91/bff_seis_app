
export interface IStorageRepository {
    getPresignedUrl(objectKey: string, operation: 'getObject' | 'putObject'): Promise<string>;
    saveObject(file: Buffer, objectType: string, userUuid: string): Promise<string>;
}