import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import axios, { isAxiosError } from 'axios';

export interface SiiRawResponse {
    captchaInvalido: boolean;
    registrado: boolean;
    nombre: string;
    fechaConsulta: string;
    inicioActividades: boolean;
    fechaInicioActividades: string | null;
    conTegi: boolean;
    tiene8102: boolean;
    tieneININ: boolean;
    tieneAPME: boolean;
    tieneEMTP: boolean;
    tieneROFL: boolean;
    cumpleObligacionTributaria: string;   // "SI" | "NO"
    tienePrimeraCategoria: boolean;
    tieneTimbraje: boolean;
    timbrajes: Array<{
        codigo: string;
        descripcion: string;
        fechaTimbraje: string;
        folioFinal: string | null;
    }>;
    tieneGirosNegocio: boolean;
    girosNegocio: Array<{
        codigo: string;
        categoriaTributaria: string;
        fechaInicio: string;
        descripcion: string;
        indicadorAfectoIva: string;
    }>;
    alertaTablas: Array<{
        alertas: Array<{
            grave: string;   // "S" | "N"
            motivo: string;
            texto: string;
        }>;
    }>;
    [key: string]: any;   // campos adicionales van al JSONB raw_response
}

/**
 * Servicio que consulta directamente la API pública del SII.
 * Solo vive en el BFF — ms-core nunca habla directamente con SII.
 */
@Injectable()
export class SiiLookupService {

    private readonly logger = new Logger(SiiLookupService.name);

    private readonly SII_URL =
        'https://www2.sii.cl/app/stc/recurso/v1/consulta/getConsultaData/';

    async consultarContribuyente(rut: string, dv: string): Promise<SiiRawResponse> {
        this.logger.log(`[SII] Consultando RUT ${rut}-${dv}`);

        try {
            const { data } = await axios.post<SiiRawResponse>(
                this.SII_URL,
                { rut, dv, reAction: 'consultaSTC', reToken: ' ' },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10_000,
                },
            );

            if (data.captchaInvalido) {
                this.logger.warn(`[SII] captchaInvalido=true para RUT ${rut}-${dv}`);
                throw new BadGatewayException('SII: token inválido o expirado');
            }

            this.logger.log(`[SII] Respuesta OK para RUT ${rut}-${dv} | registrado=${data.registrado}`);
            return data;

        } catch (error: any) {
            if (isAxiosError(error)) {
                this.logger.error(`[SII] Error HTTP ${error.response?.status} consultando RUT ${rut}: ${error.message}`);
                throw new BadGatewayException(`Error consultando SII: ${error.message}`);
            }
            throw error;
        }
    }
}
