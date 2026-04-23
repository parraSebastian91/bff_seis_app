import { SystemNavigationModel } from "src/core/domain/models/usuario/value-object/SystemNavigation.model";
class Sistema {
        nombre: string;
        ruta: string;
        descripcion: string;
        icono: string;
        modulos: Modulo[];
    }

class Modulo {
    nombre: string;
    ruta: string;
    descripcion: string;
    icono: string;
    funcionalidades: Funcionalidad[];
    organizacionId: string[];
}

class Funcionalidad {
    nombre: string;
    ruta: string;
    descripcion: string;
    icono: string;
    permisos: Permiso[];
}

class Permiso {
    codigo: string;
    nombre: string;
}
export class SystemNavigationDTO {
    sistemas: Sistema[];
    static toModel(data: SystemNavigationDTO): SystemNavigationModel {
        const model = new SystemNavigationModel();
        console.log(data)
        model.sistemas = data.sistemas;
        return model;
    }
}