import { ValueObject } from "src/core/domain/shared/valueObject";

export class TipoDocumento extends ValueObject<string> {
    constructor(value: string) {
        super(value, "Tipo de documento no válido");
    }

    protected validate(value: string): boolean {
        const validTypes = ["DNI", "Pasaporte", "RUT"];
        return validTypes.includes(value);
    }
}