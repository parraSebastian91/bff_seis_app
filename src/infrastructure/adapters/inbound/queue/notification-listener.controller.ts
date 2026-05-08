import { Controller, Inject, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import type { INotificationUseCase } from 'src/core/domain/ports/inbound/notificationUseCase.port';
import { NotificacionDTO } from './dto/notification.dto';
import { CATEGORY_PROCESS } from 'src/core/domain/models/constantes.model';
import { FacturaDTO } from './dto/factura.dto';


const STORAGE_NOTIFICATION_PATTERN = 'dte.process.notification';
@Controller()
export class NotificationListenerController {
  private readonly logger = new Logger(NotificationListenerController.name);

  constructor(
    @Inject('NOTIFICATION_USE_CASE') private readonly notificationUseCase: INotificationUseCase,
  ) {
    this.logger.log('NotificationListenerController initialized');
  }

  @EventPattern(STORAGE_NOTIFICATION_PATTERN)
  async handleNotificationEvent(
    @Payload() payload: NotificacionDTO<any>,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    const startedAt = Date.now();

    try {
      this.logger.log(
        `[IN] Storage notification received | pattern=${STORAGE_NOTIFICATION_PATTERN} | correlationId=${payload.correlationId} | eventType=${payload.eventType}`,
      );

      if (payload === null || payload === undefined) {
        this.logger.warn(
          `[WARN] Empty notification payload | pattern=${STORAGE_NOTIFICATION_PATTERN}`,
        );
        channel.ack(message);
        return;
      }

      // Log del payload completo para debugging
      this.logger.debug(
        `[DEBUG] Full payload | pattern=${STORAGE_NOTIFICATION_PATTERN} | correlationId=${payload?.correlationId} | data=${JSON.stringify(payload)}`,
      );

      // Procesar según tipo de evento
      switch (payload.eventType) {
        case CATEGORY_PROCESS.DOCUMENT_DTE:
          // Aquí puedes actualizar estado en BD, notificar al usuario, etc.
          await this.notificationUseCase.ExecuteSendNotification(payload as NotificacionDTO<FacturaDTO>);
          break;

        case 'STORAGE_UPLOAD_FAILED':
          this.logger.error(
            `[ERROR] Fallo en almacenamiento | pattern=${STORAGE_NOTIFICATION_PATTERN} | reason=${payload.data?.errorMessage}`,
          );
          // Manejar error, registrar en BD, notificar al usuario
          break;

        case 'STORAGE_PROCESSING':
          this.logger.log(
            `[PROCESSING] Procesando archivo | pattern=${STORAGE_NOTIFICATION_PATTERN}`,
          );
          break;

        default:
          this.logger.log(
            `[INFO] Evento desconocido | pattern=${STORAGE_NOTIFICATION_PATTERN} | eventType=${payload.eventType}`,
          );
      }

      this.logger.log(
        `[OK] Notificación procesada exitosamente | pattern=${STORAGE_NOTIFICATION_PATTERN} | durationMs=${Date.now() - startedAt}`,
      );

      // ACK: mensaje procesado exitosamente
      channel.ack(message);

    } catch (error: any) {
      this.logger.error(
        `[FAIL] Error procesando notificación | pattern=${STORAGE_NOTIFICATION_PATTERN} | reason=${error?.message ?? error} | durationMs=${Date.now() - startedAt}`,
      );

      // NACK sin requeue: descarta el mensaje para evitar loops infinitos
      channel.nack(message, false, false);
    }
  }
}