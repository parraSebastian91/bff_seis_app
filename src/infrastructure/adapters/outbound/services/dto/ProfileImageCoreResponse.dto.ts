import { ImageMetadataModel, UserImagesModel } from "src/core/domain/models/usuario/userProfile.model";

class ProfileImageMetadata {
    size: string;
    width: number;
    format: string;
    height: number;
    headers: string;
}

export class ProfileImageCoreQueryResponse {
    category: string;
    path: string;
    metadata: ProfileImageMetadata

    static toDomainModel(queryResult: ProfileImageCoreQueryResponse[], publicEndpoint: string): UserImagesModel {
        const userProfileImage = new UserImagesModel();

        for (const item of queryResult) {
            const metadata: ImageMetadataModel = {
                width: item.metadata.width,
                format: item.metadata.format,
                height: item.metadata.height,
                headers: item.metadata.headers?.toString() || "",
                path: `${publicEndpoint}/${item.path}`
            };
            userProfileImage.addImage(item.category, item.metadata.size, metadata);
        }


        return userProfileImage;
    }

}