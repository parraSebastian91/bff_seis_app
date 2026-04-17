export class ProfileImageError extends Error {
    __proto__ = Error;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, ProfileImageError.prototype);
    }
}