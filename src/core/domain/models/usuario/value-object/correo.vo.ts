import { ValueObject } from "src/core/domain/shared/valueObject";

export class Correo extends ValueObject<string> {
    
    constructor(value: string) {
        super(value, "Correo electrónico no válido");
    }

    protected validate(value: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }
}