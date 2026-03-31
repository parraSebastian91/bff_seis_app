/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { MenuPortalQuery } from './query/menuPortal.query';
import { IPortalUseCase } from 'src/core/domain/ports/inbound/portalUsecase.port';
import type { ICoreService } from 'src/core/domain/ports/outbound/core.service.interface';

@Injectable()
export class PortalUseCaseService implements IPortalUseCase {

    constructor(private readonly usuarioCoreService: ICoreService) {}    

    ExecuteGetMenuPortal(query: MenuPortalQuery): Promise<any> {
       return this.usuarioCoreService.GetPortalMenuByUsuario(query.userUuid);
    }
}