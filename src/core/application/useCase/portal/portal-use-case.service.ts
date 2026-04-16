/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, Logger } from '@nestjs/common';
import { MenuPortalQuery } from './query/menuPortal.query';
import { IPortalUseCase } from 'src/core/domain/ports/inbound/portalUsecase.port';
import type { ICoreService } from 'src/core/domain/ports/outbound/core.service.interface';

@Injectable()
export class PortalUseCaseService implements IPortalUseCase {
    private readonly logger = new Logger(PortalUseCaseService.name);

    constructor(private readonly usuarioCoreService: ICoreService) {}    

    async ExecuteGetMenuPortal(query: MenuPortalQuery): Promise<any> {
      const startedAt = Date.now();
      this.logger.log(`[START] Obtener menu portal | userUuid=${query.userUuid}`);

      try {
          const menu = await this.usuarioCoreService.GetPortalMenuByUsuario(query.userUuid);
          this.logger.log(`[OK] Menu portal obtenido | userUuid=${query.userUuid} | durationMs=${Date.now() - startedAt}`);
          return menu;
      } catch (error: any) {
          this.logger.error(`[FAIL] Obtener menu portal | userUuid=${query.userUuid} | durationMs=${Date.now() - startedAt} | reason=${error?.message ?? error}`);
          throw error;
      }
    }
}