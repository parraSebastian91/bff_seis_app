import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import type { Cache } from 'cache-manager';
import { ICacheRepository } from "src/core/domain/ports/outbound/CacheRepository.interface";
import { AuthCodeStored } from "src/core/domain/models/authCode.model";

export class CacheRepositoryAdapter implements ICacheRepository {

    key = {
        authCode: (code: string) => `auth_code:${code}`,
        session: (sessionId: string) => `sess:${sessionId}`
    }

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    async getAuthCode(code: string): Promise<AuthCodeStored | null> {
        const key = this.key.authCode(code);
        const data = await this.cacheManager.get<string>(key);
        if (!data) return null;
        return JSON.parse(data) as AuthCodeStored;
    }

    async getAccessToken(sessionId: string): Promise<string | null> {

        this.validateConexion()
        const decoded = decodeURIComponent(sessionId);
        const normalized = decoded.startsWith('s:') ? decoded.slice(2) : decoded;
        const withoutSignature = normalized.split('.')[0];

        const candidates = Array.from(
            new Set([
                sessionId,
                decoded,
                normalized,
                withoutSignature,
            ].filter(Boolean))
        );

        const keysToTry = Array.from(
            new Set([
                ...candidates.map((value) => this.key.session(value)),
                ...candidates.map((value) => `session:${value}`),
                ...candidates,
            ])
        );

        for (const key of keysToTry) {
            const data = await this.cacheManager.get<string>(key);
            console.log(`Trying cache key: ${key} - Found: ${!!data}`);
            if (data) {
                return data;
            }
        }

        return null;
    }

    async validateConexion(): Promise<void> {
        try {
            console.log('Validating cache connection...');
            await this.cacheManager.set('cache_test_key', 'test', 5 * 1000);
            const value = await this.cacheManager.get<string>('cache_test_key');
            if (value !== 'test') {
                console.error('Cache validation failed: value mismatch');
                throw new Error('Cache validation failed: value mismatch');
            }
            console.log('Cache connection validated successfully');
            // await this.cacheManager.del('cache_test_key');
        } catch (error) {
            console.error('Cache connection validation error:', error);
            throw new Error('Unable to connect to cache');
        }
    }

}