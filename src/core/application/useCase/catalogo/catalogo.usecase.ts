import { ICatalogo } from "src/core/domain/ports/inbound/catalogo.interface";
import { ICoreService } from "src/core/domain/ports/outbound/core.service.interface";

export class CatalogoUseCase implements ICatalogo {
    constructor(private readonly coreService: ICoreService) { }

    // ── Catalogos Geográficos ───────────────────────────────────────────────

    /**
     * Obtiene las regiones de un país específico.
     * @param pais Código del país.
     * @returns Lista de regiones.
     */
    getRegiones(pais: string) {
        return this.coreService.getRegiones(pais);
    }


    /**
     * Obtiene las provincias de una región específica.
     * @param regionId ID de la región.
     * @returns Lista de provincias.
     */
    getProvincias(regionId: number) {
        return this.coreService.getProvincias(regionId);
    }

    /**
     * Obtiene las comunas de una provincia específica.
     * @param provinciaId ID de la provincia.
     * @returns Lista de comunas.
     */
    getComunas(provinciaId: number) {
        return this.coreService.getComunas(provinciaId);
    }

    /**
     * Obtiene los bancos de un país específico.
     * @param pais Código del país.
     * @returns Lista de bancos.
     */
    getBancos(pais: string) {
        return this.coreService.getBancos(pais);
    }

    /**
     * Obtiene los productos financieros de una organización específica.
     * @param tipoOrg Tipo de organización.
     * @returns Lista de productos financieros.
     */
    getProductosFinancieros(tipoOrg?: string) {
        return this.coreService.getProductosFinancieros(tipoOrg);
    }
    // ── Catalogos de MEDIA schema ─────────────────────────────────────────────

    /**
     * Obtiene las categorías de medios de un tipo específico.
     * @param mediaType Tipo de medio.
     * @returns Lista de categorías de medios.
     */
    getMediaCategory(mediaType: string) {
        return this.coreService.getMediaCategory(mediaType);
    }
}