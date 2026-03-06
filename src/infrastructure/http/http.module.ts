/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
// import { PermissionsGuard } from './guards/permissions.guard';
import { APP_GUARD } from '@nestjs/core';
import { UsuariosBffController } from './controllers/usuarios-bff.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VaultService } from '../secrets/vault.service';
import { SecretsModule } from '../secrets/secrets.module';

@Module({
    imports: [
        ConfigModule,
        SecretsModule,
        JwtModule.registerAsync({
            imports: [ConfigModule, SecretsModule],
            inject: [VaultService, ConfigService],
            useFactory: async (vaultService: VaultService, configService: ConfigService) => ({
                secret: vaultService.getSecret(
                    'JWT',                // path en Vault
                    'JWT_SECRET',         // key dentro del secreto
                    configService.get<string>('JWT_SECRET', 'dev-secret') // fallback
                ),
                signOptions: { expiresIn: '1h' },
            }),
        }),
    ],
    controllers: [UsuariosBffController],
    providers: [
        AuthGuard,
        // PermissionsGuard,
        // Aplicar AuthGuard globalmente
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        // Aplicar PermissionsGuard globalmente después del AuthGuard
        // {
        //     provide: APP_GUARD,
        //     useClass: PermissionsGuard,
        // },
        // Servicios que se exportarán para ser usados en otros módulos
    ],
})
export class HttpModule { }
