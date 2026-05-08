
export interface INotificationHandler {
    emitNotification(userId: string, data: any): void;
    emitGlobalNotification(payload: any): void;
}