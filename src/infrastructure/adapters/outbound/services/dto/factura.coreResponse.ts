import { FacturaModel } from "src/core/domain/models/factura.model";

export class FacturaCoreResponse {

    static toModel(data: FacturaCoreResponse[]): FacturaModel[] {

        const model = new FacturaModel();

        return data.map(item => new FacturaModel());
    }

}