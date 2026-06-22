import { FacturaMarketplace } from "./facturaMarketPlace.mode";

export const USER_AVATAR_CATEGORY = "user-avatar";
export const USER_BANNER_CATEGORY = "user-banner";

export enum createdBy {
    FORM = "FORM",
    OCR = "OCR",
    AGENT = "AGENT"
}


export enum CATEGORY_PROCESS {
    USER_AVATAR = "user-avatar",
    ORG_AVATAR = "org-avatar",
    USER_BANNER = "user-banner",
    ORG_BANNER = "org-banner",
    DOCUMENT_DTE = "DTE-factura",
    DOCUMENT_DTE_RESPALDO = "DTE-factura-respaldo",
    DOCUMENT_OC = "orden-compra",
    DOCUMENT_GD = "guia-despacho",
    DCOUMENT_AE = "acta-entrega",
    DOCUMENT_EP = "estado-pago",
    DOCUMENT_HIS = "hoja-entrada-servicio",
    SOCIAL_POST = "social-post",
    OTHER = "OTHER",
}

export enum EVENT_CODES {
    FACTURA_PUBLICADA = "FACTURA_PUBLICADA",
    FACTURA_VACIA_PUBLICADA = "FACTURA_VACIA_PUBLICADA",
    FACTURA_DUPLICADA = "FACTURA_DUPLICADA",
    FACTURA_PROCESADA = "FACTURA_PROCESADA",
    FACTURA_ERROR_PROCESAMIENTO = "FACTURA_ERROR_PROCESAMIENTO",
}

export enum facturaEstado {
    PENDIENTE_VALIDACION = "PENDIENTE_VALIDACION",
    PUBLICADA = "PUBLICADA",
    OFERTADA = "OFERTADA",
    FINANCIADA = "FINANCIADA",
    PAGADA = "PAGADA",
    RECHAZADA = "RECHAZADA",
    CANCELADA = "CANCELADA",
    VENCIDA = "VENCIDA",
    DENUNCIADA = "DENUNCIADA",
}

type MarketplaceWsEvent =
    | { event: 'factura.publicada'; factura: FacturaMarketplace }
    | { event: 'factura.retirada'; facturaId: string }
    | { event: 'oferta.nueva' | 'oferta.modificada'; facturaId: string; cantidadOfertas: number; tasaMinima: number | null }
    | { event: 'mi.oferta.aceptada'; facturaId: string }
    | { event: 'factura.nueva.externa'; facturaId: string; razonSocial: string; monto: number };