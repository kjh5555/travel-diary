import { ICustomThemeRepository } from "@/domain/repositories/ICustomThemeRepository";
import { CustomThemePlace } from "@/domain/types/customTheme";
import { Place } from "@/domain/types/place";

export class AddPlaceToThemeUseCase {
    constructor(private repository: ICustomThemeRepository) {}

    async execute(themeId: string, place: Place, userId: string, note?: string): Promise<CustomThemePlace | null> {
        if (!themeId) {
            throw new Error("테마 ID는 필수입니다");
        }
        if (!userId) {
            throw new Error("User ID is required");
        }

        if (!place || !place.id) {
            throw new Error("장소 정보는 필수입니다");
        }

        return this.repository.addPlace(themeId, place, userId, note?.trim());
    }
}
