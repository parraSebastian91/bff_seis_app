import { MenuPortalQuery } from "src/core/application/useCase/portal/query/menuPortal.query";

export interface IPortalUseCase {
    ExecuteGetMenuPortal(query: MenuPortalQuery): Promise<any>;
}