
export const STORAGE_SERVICE = 'STORAGE_SERVICE';

export interface IStorageService {
    getPresignedPutUrl(userUuid: string, objectType: string, fileName: string, fileType: string, userName: string, organization?: string): Promise<string>;
}
