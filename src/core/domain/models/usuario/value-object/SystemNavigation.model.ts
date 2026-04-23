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
export class SystemNavigationModel {
    sistemas: Sistema[];
}