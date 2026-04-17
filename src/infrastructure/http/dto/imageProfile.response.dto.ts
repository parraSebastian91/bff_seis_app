import { USER_AVATAR_CATEGORY, USER_BANNER_CATEGORY } from "src/core/domain/models/constantes.model";
import { ImageMetadataModel, UserImagesModel } from "src/core/domain/models/usuario/userProfile.model";



class MediaAssets {

    private width: number;
    private format: string;
    private height: number;
    private headers: string;
    private path: string;

    constructor(width: number, format: string, height: number, headers: string, path: string) {
        this.width = width;
        this.format = format;
        this.height = height;
        this.headers = headers;
        this.path = path;
    }

    public getWidth(): number {
        return this.width;
    }

    public getFormat(): string {
        return this.format;
    }

    public getHeight(): number {
        return this.height;
    }

    public getHeaders(): string {
        return this.headers;
    }

    public getPath(): string {
        return this.path;
    }

    public getMediaAssets(): MediaAssets {
        return new MediaAssets(this.width, this.format, this.height, this.headers, this.path);
    }

}

export class ImageProfileResponseDto {

    avatar:any; // Map<size, MediaAssets>
    banner: any; // Map<size, MediaAssets>

    constructor() {
        this.avatar = new Map<string, MediaAssets>();
        this.banner = new Map<string, MediaAssets>();
    }

    addImage(category: string, size: string, metadata: MediaAssets) {
        if (category === USER_AVATAR_CATEGORY) {
            this.avatar = Object.assign({}, this.avatar, { [size]: metadata });
        } else if (category === USER_BANNER_CATEGORY) {
            this.banner = Object.assign({}, this.banner, { [size]: metadata });
        } else {
            throw new Error(`Unknown category: ${category}`);
        }
    }

    getImage(category: string, size: string): MediaAssets | undefined {
        if (category === USER_AVATAR_CATEGORY) {
            return this.avatar[size];
        } else if (category === USER_BANNER_CATEGORY) {
            return this.banner[size];
        } else {
            throw new Error(`Unknown category: ${category}`);
        }
    }

    static builder(userImagesModel: UserImagesModel): ImageProfileResponseDto {
        const responseDto = new ImageProfileResponseDto();
        console.log("Building ImageProfileResponseDto from UserImagesModel:", userImagesModel);
        userImagesModel.avatar.forEach((metadata, size) => {
            responseDto.addImage(USER_AVATAR_CATEGORY, size, new MediaAssets(metadata.width, metadata.format, metadata.height, metadata.headers, metadata.path));
        });
        userImagesModel.banner.forEach((metadata, size) => {
            responseDto.addImage(USER_BANNER_CATEGORY, size, new MediaAssets(metadata.width, metadata.format, metadata.height, metadata.headers, metadata.path));
        });
        return responseDto;
    }

    static toModel(imageProfileResponseDto: ImageProfileResponseDto): UserImagesModel {
        const userImagesModel = new UserImagesModel();
        imageProfileResponseDto.avatar.forEach((metadata, size) => {
            userImagesModel.avatar.set(size, new ImageMetadataModel(metadata.getWidth(), metadata.getFormat(), metadata.getHeight(), metadata.getHeaders(), metadata.getPath()));
        }
        );
        imageProfileResponseDto.banner.forEach((metadata, size) => {
            userImagesModel.banner.set(size, new ImageMetadataModel(metadata.getWidth(), metadata.getFormat(), metadata.getHeight(), metadata.getHeaders(), metadata.getPath()));
        });
        return userImagesModel;
    }

}