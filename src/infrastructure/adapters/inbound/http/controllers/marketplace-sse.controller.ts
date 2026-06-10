import { BadRequestException, Controller, Logger, MessageEvent, Query, Sse, UseFilters } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Roles } from '../decorators/roles.decorator';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import { MarketplaceScope, MarketplaceSseService } from 'src/infrastructure/adapters/outbound/sse/marketplace-sse.service';

@Controller('facturas/marketPlace')
@UseFilters(ErrorHandler)
export class MarketplaceSseController {
  private readonly logger = new Logger(MarketplaceSseController.name);

  constructor(private readonly marketplaceSseService: MarketplaceSseService) {}

  @Sse('stream')
  @Roles('EJECUTIVO_FINANCIADORA', 'ADMIN_FINANCIADORA', 'SUPER_ADMIN')
  stream(
    @Query('scope') scopeQuery: string = 'all',
    @Query('financieraId') financieraId?: string,
  ): Observable<MessageEvent> {
    const scope = this.normalizeScope(scopeQuery);
    this.logger.debug(`SSE stream requested | scope=${scope} | financieraId=${financieraId ?? 'all'}`);
    return this.marketplaceSseService.stream(scope, financieraId);
  }

  private normalizeScope(rawScope: string): MarketplaceScope {
    const normalized = String(rawScope ?? 'all').toLowerCase();
    if (normalized === 'preferidos' || normalized === 'nuevos' || normalized === 'all') {
      return normalized;
    }

    throw new BadRequestException('scope must be preferidos, nuevos or all');
  }
}
