import { AuthCodeStored } from "../../models/authCode.model";

export const CACHE_REPOSITORY = 'CACHE_REPOSITORY';

export interface ICacheRepository {
    getAuthCode(code: string): Promise<AuthCodeStored | null>;
    getAccessToken(sessionId: string): Promise<string | null>;
}