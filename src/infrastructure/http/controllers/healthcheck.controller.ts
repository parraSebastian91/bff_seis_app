/*
https://docs.nestjs.com/controllers#controllers
*/
import { Controller, Get, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { VaultService } from 'src/infrastructure/secrets/vault.service';
import { Public } from '../decorators/public.decorator';

@Controller('')
@Public()
export class HealthCheckController {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
        private readonly vaultService: VaultService,
    ) { }

    @Get('health')
    async health() {
        const checks: Record<string, any> = {};


        try {
            const key = '__health:redis:ping';
            const value = `pong-${Date.now()}`;
            await this.cache.set(key, value, 5_000);
            const read = await this.cache.get<string>(key);
            checks.redis = {
                status: read === value ? 'up' : 'down',
            };
        } catch (error: any) {
            checks.redis = { status: 'down', error: error?.message ?? 'unknown' };
        }

        checks.vault = {
            status: this.vaultService.isAvailable() ? 'up' : 'down',
        };

        const up = Object.values(checks).every((c: any) => c.status === 'up');

        return {
            status: up ? 'ok' : 'error',
            timestamp: new Date().toISOString(),
            checks,
        };
    }

    @Get('liveness')
    liveness() {
        return 'OK';
    }
}
