export class UserProfileDTO {
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

    static normalize(data: any): UserProfileDTO {
        const dto = new UserProfileDTO();
        dto.username = data.username;
        dto.nombres = data.nombres.primitiveValue;
        dto.apellido_paterno = data.apellido_paterno.primitiveValue;
        dto.apellido_materno = data.apellido_materno.primitiveValue;
        dto.direccion = data.direccion;
        dto.celular = data.celular;
        dto.correo = data.correo;
        dto.fecha_nacimiento = data.fecha_nacimiento;
        dto.redes_sociales = data.redes_sociales;
        dto.tipo_documento = data.tipo_documento;
        dto.numero_documento = data.numero_documento;
        dto.avatar = data.avatar;
        dto.tipo_contacto = data.tipo_contacto;
        return dto;
    }
}