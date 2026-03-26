import { ValueDomainError } from "../errors/valueDomain.error"


export abstract class ValueObject<T> {

    protected abstract validate(value: T): boolean;

    constructor(private primitiveValue: T, errorMessage: string) {
        if (!this.validate(primitiveValue)) throw new ValueDomainError(errorMessage)
    }

    getValue() {
        return this.primitiveValue
    }
}