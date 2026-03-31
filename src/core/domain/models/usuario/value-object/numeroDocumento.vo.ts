import { ValueObject } from "src/core/domain/shared/valueObject";

export class NumeroDocumento extends ValueObject<string> {
    constructor(valor: string) {
        super(valor, "Número de documento no válido");
    }

    protected validate(value: string): boolean {
        const regex = /^(\d{1,2}(\.?\d{3}){2}-?[\dkK])$/;
        return regex.test(value);
    }
}