import { FacturaDTO } from "src/infrastructure/adapters/inbound/queue/dto/factura.dto";
import { NotificacionDTO } from "src/infrastructure/adapters/inbound/queue/dto/notification.dto";

export interface INotificationUseCase {
    ExecuteSendNotification(notification: NotificacionDTO<FacturaDTO>): Promise<void>;
}