export interface ICatalogo {
    getRegiones(pais: string): Promise<any>;
    getProvincias(regionId: number): Promise<any>;
    getComunas(provinciaId: number): Promise<any>;
    getBancos(pais: string): Promise<any>;
    getProductosFinancieros(tipoOrg?: string): Promise<any>;
    getMediaCategory(mediaType: string): Promise<any>;
}