class Sistema {
    nombre: string;
    ruta: string;
    descripcion: string;
    modulos: Modulo[];
}

class Modulo {
    nombre: string;
    ruta: string;
    descripcion: string;
    funcionalidades: Funcionalidad[];
}

class Funcionalidad {
    nombre: string;
    ruta: string;
    descripcion: string;
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

export class SystemNavigationModel {
    organizacion: Organizacion[];
    contacto: Contacto;
}