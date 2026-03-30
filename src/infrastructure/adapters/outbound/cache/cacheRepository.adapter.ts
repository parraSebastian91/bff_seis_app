import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { ICacheRepository } from "src/core/domain/ports/outbound/CacheRepository.interface";
import { AuthCodeStored } from "src/core/domain/models/authCode.model";

export class CacheRepositoryAdapter implements ICacheRepository {
    private readonly redisStore: KeyvRedis<unknown>;

    key = {
        authCode: (code: string) => `auth_code:${code}`,
        session: (sessionId: string) => `sess:${sessionId}`
    }

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private configService: ConfigService,
    ) {
        const redisHost = this.configService.get<string>('redis.host') || 'localhost';
        const redisPort = this.configService.get<number>('redis.port') || 6379;
        const redisDb = this.configService.get<number>('redis.db') ?? 0;
        this.redisStore = new KeyvRedis(`redis://${redisHost}:${redisPort}/${redisDb}`);
    }

    async getAuthCode(code: string): Promise<AuthCodeStored | null> {
        const key = this.key.authCode(code);
        const data = await this.cacheManager.get<string>(key);
        if (!data) return null;
        return JSON.parse(data) as AuthCodeStored;
    }

    async getAccessToken(sessionId: string): Promise<string | null> {

        // await this.validateConexion();
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
            const redisData = await this.redisStore.get(key);
            console.log(`Trying redis key: ${key} - Found: ${!!redisData}`);
            if (redisData) {
                const token = this.extractTokenFromCacheValue(redisData);
                if (token) {
                    return token;
                }
            }

            const data = await this.cacheManager.get<unknown>(key);
            console.log(`Trying cache key fallback: ${key} - Found: ${!!data}`);
            if (data) {
                const token = this.extractTokenFromCacheValue(data);
                if (token) {
                    return token;
                }
            }
        }

        return null;
    }

    private extractTokenFromCacheValue(value: unknown): string | null {
        const asString = typeof value === 'string' ? value : null;

        if (asString) {
            if (this.looksLikeJwt(asString)) {
                return asString;
            }

            try {
                const parsed = JSON.parse(asString) as Record<string, unknown>;
                return this.getTokenFromObject(parsed);
            } catch {
                return null;
            }
        }

        if (typeof value === 'object' && value !== null) {
            return this.getTokenFromObject(value as Record<string, unknown>);
        }

        return null;
    }

    private getTokenFromObject(value: Record<string, unknown>): string | null {
        const token = value.accessToken;
        if (typeof token === 'string' && this.looksLikeJwt(token)) {
            return token;
        }

        const nestedToken = value.session && typeof value.session === 'object'
            ? (value.session as Record<string, unknown>).accessToken
            : null;

        if (typeof nestedToken === 'string' && this.looksLikeJwt(nestedToken)) {
            return nestedToken;
        }

        return null;
    }

    private looksLikeJwt(value: string): boolean {
        return value.split('.').length === 3;
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