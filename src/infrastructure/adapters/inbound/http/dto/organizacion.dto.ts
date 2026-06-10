import { IsIn, IsNotEmpty, IsNumberString, IsOptional, IsString, Length } from "class-validator";

export class SiiLookupDto {
    @IsNumberString()
    rut: string;

    @IsString()
    @Length(1, 1)
    dv: string;

    /** ID interno de la organización a la que se asociará la verificación */
    organizacionId: number;
}

type TipoPersona = 'JURIDICA' | 'PERSONA_NATURAL';
type TipoParticipante = 'CEDENTE' | 'FINANCIERA' | 'BROKER';


interface GiroComercial {
    codigo: string;
    categoriaTributaria?: string;
    fechaInicio?: string;
    descripcion: string;
    indicadorAfectoIva?: string;
}

export class CrearOrganizacionDto {
    @IsNotEmpty()
    @IsIn(['JURIDICA', 'PERSONA_NATURAL'])
    tipoPersona: TipoPersona;

    @IsNotEmpty()
    @IsIn(['CEDENTE', 'FINANCIADORA', 'BROKER'])
    tipoParticipacion: TipoParticipante;

    @IsNotEmpty()
    @IsString()
    rut: string;

    @IsNotEmpty()
    @IsString()
    razonSocial: string;

    @IsOptional()
    giros?: GiroComercial[];

    @IsOptional()
    rawSii?: Record<string, any>;
}