export class ObjectKeyNotFoundError extends Error {
    __proto__ = Error;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, ObjectKeyNotFoundError.prototype);
    }
}