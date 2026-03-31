import { SystemNavigationModel } from "./../../core/domain/models/usuario/value-object/SystemNavigation.model";

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

class Organizacion {
    nombre: string;
    uuid: string;
    sistemas: Sistema[];
}

class Contacto {
    nombres: string;
    usuario: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correo: string;
    avatar: string;
}

export class SystemNavigationDTO {
    organizacion: Organizacion[];
    contacto: Contacto;

    static toModel(data: SystemNavigationDTO): SystemNavigationModel {
        const model = new SystemNavigationModel();
        console.log(data.organizacion)
        model.organizacion = data.organizacion;
        model.contacto = data.contacto;
        return model;
    }
}