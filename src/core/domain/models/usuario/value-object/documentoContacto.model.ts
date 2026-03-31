import { NumeroDocumento } from "./numeroDocumento.vo";
import { TipoDocumento } from "./tipoDocumento.vo";

export class DocumentoContacto {
    tipoDocumento: TipoDocumento;
    numeroDocumento: NumeroDocumento;

    static create(tipo: string, numero: string): DocumentoContacto {
        const documento = new DocumentoContacto();
        documento.tipoDocumento = new TipoDocumento(tipo);
        documento.numeroDocumento = new NumeroDocumento(numero);
        return documento;
    }
}