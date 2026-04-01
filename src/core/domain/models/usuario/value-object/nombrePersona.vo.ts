import { ValueObject } from "src/core/domain/shared/valueObject";

export class NombrePersona extends ValueObject<string> {
    constructor(value: string) {
        super(value, "Nombre no válido");
    }

    protected validate(value: string): boolean {
        return value.length < 80;
    }
}