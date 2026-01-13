import { IJourneyShareRepository } from "@/domain/repositories/IJourneyShareRepository";
import { TripPhoto } from "@/domain/types/friend";

export class AddTripPhotoUseCase {
    constructor(private repository: IJourneyShareRepository) {}

    async execute(placeId: string, userId: string, imageUrl: string, caption?: string): Promise<TripPhoto> {
        if (!imageUrl) {
            throw new Error("이미지가 필요합니다.");
        }

        return await this.repository.addPhoto(placeId, userId, imageUrl, caption?.trim());
    }

    async delete(photoId: string, userId: string): Promise<void> {
        await this.repository.deletePhoto(photoId, userId);
    }

    async getPhotos(placeId: string): Promise<TripPhoto[]> {
        return await this.repository.getPhotos(placeId);
    }
}
