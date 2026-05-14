export enum CampoFactura {
    INVALIDO = "INVALIDO",
    NUMERO_FACTURA = "numeroFactura",
    RUT_DEUDOR = "rutDeudor",
    NOMBRE_RAZON_SOCIAL_DEUDOR = "nombreRazonSocialDeudor",
    MONTO_TOTAL = "montoTotal",
    FECHA_VENCIMIENTO = "fechaVencimiento"
}



export class FacturaUpdateRequestDto {
    id: string;
    ownerUUID: string;
    gestor: string;
    campoEditado: CampoEditado;

    constructor(id: string, ownerUUID: string, gestor: string, campoEditado: CampoEditado) {
        this.id = id;
        this.ownerUUID = ownerUUID;
        this.gestor = gestor;
        this.campoEditado = campoEditado;
    }

}

export class CampoEditado {

    nombre: string;
    valor: string;

    constructor(nombre: CampoFactura, valor: string) {
        this.nombre = nombre;
        this.valor = valor;
    }
}