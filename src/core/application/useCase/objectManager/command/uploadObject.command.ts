export type ObjectUploadPayload = {
    originalname?: string;
    mimetype?: string;
    size?: number;
    buffer: Buffer;
};
