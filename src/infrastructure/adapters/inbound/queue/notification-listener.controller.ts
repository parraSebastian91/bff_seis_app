import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

type NotificationEventPayload = {
  eventType?: string;
  timestamp?: string;
  source?: string;
  correlationId?: string;
  data?: unknown;
};

const NOTIFICATION_EVENT_PATTERN = 'notifications.created';

@Controller()
export class NotificationListenerController {
  private readonly logger = new Logger(NotificationListenerController.name);

  @EventPattern(NOTIFICATION_EVENT_PATTERN)
  async handleNotificationEvent(
    @Payload() payload: NotificationEventPayload,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    const correlationId =
      payload?.correlationId ??
      message?.properties?.correlationId ??
      'not-provided';

    try {
      this.logger.log(
        `[IN] Notification received | pattern=${NOTIFICATION_EVENT_PATTERN} | correlationId=${correlationId}`,
      );

      if (payload === null || payload === undefined) {
        this.logger.warn(
          `[WARN] Empty notification payload | correlationId=${correlationId}`,
        );
      }

      channel.ack(message);
    } catch (error: any) {
      this.logger.error(
        `[FAIL] Notification processing failed | correlationId=${correlationId} | reason=${error?.message ?? error}`,
      );

      // Requeue disabled to avoid infinite loops with poison messages.
      channel.nack(message, false, false);
    }
  }
}