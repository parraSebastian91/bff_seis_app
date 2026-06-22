
export const STORAGE_SERVICE = 'STORAGE_SERVICE';

export interface IStorageService {
    getPresignedPutUrl(objectKey: string, corelationId: string): Promise<{url: string}>;
    getPresignedGetUrl(storageKey: string, correlationId: string): Promise<string>;
}
