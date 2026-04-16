
export class UserProfileModel {
    username: string;
    ingreso: Date;
    activo: boolean;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    direccion: string;
    celular: string;
    correo: string;
    fecha_nacimiento: Date;
    redes_sociales: string;
    tipo_documento: string;
    numero_documento: string;
    avatar: string;
    tipo_contacto: string;
}

export class UserImagesModel {
    avatar: Map<string, MediaAssets>;
    banner: Map<string, MediaAssets>;
}

class MediaAssets {
    name: string;
    url: string;
    size: string;
}