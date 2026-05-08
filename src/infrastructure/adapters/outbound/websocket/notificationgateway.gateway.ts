/*
https://docs.nestjs.com/websockets/gateways#gateways
*/

import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { INotificationHandler } from 'src/core/domain/ports/outbound/notificationHandler.interface';
import { NotificacionDTO } from '../../inbound/queue/dto/notification.dto';
import { AUTH_USE_CASE } from 'src/core/application/application.module';
import type { ISessionUseCase } from 'src/core/domain/ports/inbound/sessionUseCase.interface';

type WsSession = {
    userUuid: string;
    username: string;
    accessToken: string;
};

@WebSocketGateway({
    cors: { origin: '*' }, // Ajusta esto en producción
    namespace: '/notifications',
})
export class NotificationGatewayGateway implements INotificationHandler, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {

    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(NotificationGatewayGateway.name);

    constructor(
        private readonly eventEmitter: EventEmitter2,
        @Inject(AUTH_USE_CASE) private readonly sessionUseCase: ISessionUseCase,
    ) {
        this.logger.log('NotificationGatewayGateway initialized');
    }
    emitGlobalNotification(payload: any): void {
        throw new Error('Method not implemented.');
    }

    @SubscribeMessage('events')
    handleEvent(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        const session = client.data?.session as WsSession | undefined;
        const roomUserId = session?.userUuid;

        if (!roomUserId) {
            this.logger.warn(`Socket sin sesión válida en evento | socketId=${client.id}`);
            client.disconnect(true);
            return;
        }

        this.eventEmitter.emit('ws.event.received', { userId: roomUserId, data });
    }


    // Manejar conexión
    async handleConnection(client: Socket) {
        const requestedUserId = String(client.handshake.query.userId ?? '');
        const correlationId = String(client.handshake.headers['x-correlation-id'] ?? 'not-provided');

        try {
            const sessionId = this.extractSessionFromHandshake(client);
            const session = await this.sessionUseCase.executeValidateSession({ sessionId });

            const isSameIdentity = requestedUserId === session.username || requestedUserId === session.userUuid;
            if (requestedUserId && !isSameIdentity) {
                this.logger.warn(
                    `[WS-REJECT] Identidad no coincide con sesión | socketId=${client.id} | requestedUserId=${requestedUserId} | username=${session.username} | userUuid=${session.userUuid} | correlationId=${correlationId}`,
                );
                client.disconnect(true);
                return;
            }

            client.data.session = session;
            client.join(session.userUuid);
            client.join(session.username);

            this.logger.log(
                `[WS-OK] Cliente autenticado | socketId=${client.id} | userUuid=${session.userUuid} | username=${session.username} | correlationId=${correlationId}`,
            );
        } catch (error: any) {
            this.logger.warn(
                `[WS-REJECT] Conexión rechazada por sesión inválida | socketId=${client.id} | reason=${error?.message ?? error}`,
            );
            client.disconnect(true);
        }
    }

    handleDisconnect(client: Socket) {
        const session = client.data?.session as WsSession | undefined;
        if (session?.userUuid) {
            client.leave(session.userUuid);
            client.leave(session.username);
            this.logger.log(`Cliente desconectado y salido de sala | userUuid=${session.userUuid} | username=${session.username}`);
        }
    }

    @OnEvent('ws.event.send')
    async handleEventSender(event: NotificacionDTO<any>): Promise<void> {
        const sessionFromActive = await this.resolveUsernameFromActiveSession(event.gestor);

        if (!sessionFromActive) {
            this.logger.warn(
                `[WS-WARN] No se pudo resolver username para envío de notificación | ownerUuid=${event.ownerUUID} | correlationId=${event.correlationId}`,
            );
            return;
        }

        this.logger.log(
            `Evento WS recibido para envío: ${JSON.stringify(event)} | targetUsername=${sessionFromActive.username} `,
        );

        this.emitNotification(sessionFromActive.username, event);
    }

    emitNotification(userId: string, payload: any) {
        this.logger.log(`Emitiendo notificación a usuario ${userId} con payload: ${JSON.stringify(payload)}`);
        this.server.to(userId).emit('new_notification', payload);
    }

    private async resolveUsernameFromActiveSession(username: string): Promise<WsSession | undefined> {
        try {
            const sockets = await this.server.fetchSockets();
            const socketWithSession = sockets.find((socket) => {
                const session = socket.data?.session as WsSession | undefined;
                console.log(`[WS-DEBUG] Revisando socket ${socket.id} para sessionUserUuid=${session?.userUuid} | sessionUsername=${session?.username}`);
                return session?.username === username;
            });
            console.log(`[WS-DEBUG] Socket encontrado para username=${username}: ${socketWithSession?.data?.session}`);
            const session = socketWithSession?.data?.session as WsSession | undefined;
            return session;
        } catch (error: any) {
            this.logger.warn(
                `[WS-WARN] No fue posible resolver username desde sesión activa | username=${username} | reason=${error?.message ?? error}`,
            );
            return undefined;
        }
    }

    afterInit(server: Server) {
        this.logger.log('Socket is live')
    }

    private extractSessionFromHandshake(client: Socket): string {
        const rawCookieHeader = client.handshake.headers.cookie;
        if (!rawCookieHeader) {
            throw new UnauthorizedException('No session cookie found');
        }

        const cookies = rawCookieHeader
            .split(';')
            .map((item) => item.trim())
            .filter(Boolean)
            .reduce<Record<string, string>>((acc, cookie) => {
                const separatorIndex = cookie.indexOf('=');
                if (separatorIndex <= 0) return acc;
                const key = cookie.slice(0, separatorIndex).trim();
                const value = cookie.slice(separatorIndex + 1).trim();
                acc[key] = value;
                return acc;
            }, {});

        const rawSession = cookies['auth.session'];
        if (!rawSession) {
            throw new UnauthorizedException('No session cookie found');
        }

        const decodedSession = decodeURIComponent(rawSession);
        const unsigned = decodedSession.startsWith('s:') ? decodedSession.slice(2) : decodedSession;
        const sessionId = unsigned.split('.')[0];

        if (!sessionId) {
            throw new UnauthorizedException('Invalid session cookie format');
        }

        return sessionId;
    }
}
