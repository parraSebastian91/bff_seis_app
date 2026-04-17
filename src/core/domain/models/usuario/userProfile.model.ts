import { USER_AVATAR_CATEGORY, USER_BANNER_CATEGORY } from "../constantes.model";

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
    tipo_contacto: string;

    constructor(
    ) { 
            this.username = "";
            this.ingreso = new Date();
            this.activo = false;
            this.nombres = "";
            this.apellido_paterno = "";
            this.apellido_materno = "";
            this.direccion = "";
            this.celular = "";
            this.correo = "";
            this.fecha_nacimiento = new Date();
            this.redes_sociales = "";
            this.tipo_documento = "";
            this.numero_documento = "";
            this.tipo_contacto = "";
    }
}

export class UserImagesModel {
    avatar: Map<string, ImageMetadataModel>;
    banner: Map<string, ImageMetadataModel>;
    constructor() {
        this.avatar = new Map<string, ImageMetadataModel>();
        this.banner = new Map<string, ImageMetadataModel>();
    }

    addImage(category: string, size: string, metadata: ImageMetadataModel) {
        if (category === USER_AVATAR_CATEGORY) {
            this.avatar.set(size, metadata);
        } else if (category === USER_BANNER_CATEGORY) {
            this.banner.set(size, metadata);
        } else {
            throw new Error(`Unknown category: ${category}`);
        }
    }

    getImage(category: string, size: string): ImageMetadataModel | undefined {
        if (category === USER_AVATAR_CATEGORY) {
            return this.avatar.get(size);
        } else if (category === USER_BANNER_CATEGORY) {
            return this.banner.get(size);
        } else {
            throw new Error(`Unknown category: ${category}`);
        }
    }
}

export class ImageMetadataModel {
    width: number;
    format: string;
    height: number;
    headers: string;
    path: string;

    constructor(width: number, format: string, height: number, headers: string, path: string) {
        this.width = width;
        this.format = format;
        this.height = height;
        this.headers = headers;
        this.path = path;
    }
}
