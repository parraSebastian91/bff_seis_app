import { Injectable, Logger } from "@nestjs/common";
import { OnEvent, EventEmitter2 } from "@nestjs/event-emitter";
import { INotificationUseCase } from "src/core/domain/ports/inbound/notificationUseCase.port";
import { FacturaDTO } from "src/infrastructure/adapters/inbound/queue/dto/factura.dto";
import { NotificacionDTO } from "src/infrastructure/adapters/inbound/queue/dto/notification.dto";

@Injectable()
export class NotificationUseCase implements INotificationUseCase {
    private readonly logger = new Logger(NotificationUseCase.name);
    constructor(private readonly eventEmitter: EventEmitter2) {
        this.logger.log('NotificationUseCase initialized');
    }

    async ExecuteSendNotification(notification: NotificacionDTO<FacturaDTO>): Promise<void> {
        this.logger.debug(`Enviando notificación a usuario ${notification.ownerUUID} con correlationID: ${notification.correlationId} y evento: ${notification.eventType}`);

        this.eventEmitter.emit('ws.event.send', notification);
        if (notification.message.error) {

        }else {

        }



    }

    @OnEvent('ws.event.received')
    async handleWsEvent(event: NotificacionDTO<any>): Promise<void> {
        this.logger.log(`Evento WS recibido de usuario ${event.ownerUUID}: correlationId=${event.correlationId}, eventType=${event.eventType}, message=${JSON.stringify(event.message)}, data=${JSON.stringify(event.data)}`);
        await this.ExecuteSendNotification(event);
    }
}