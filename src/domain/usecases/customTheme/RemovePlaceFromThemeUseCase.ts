import { ICustomThemeRepository } from "@/domain/repositories/ICustomThemeRepository";

export class RemovePlaceFromThemeUseCase {
    constructor(private repository: ICustomThemeRepository) {}

    async execute(themeId: string, placeId: string, userId: string): Promise<boolean> {
        if (!themeId) {
            throw new Error("테마 ID는 필수입니다");
        }
        if (!userId) {
            throw new Error("User ID is required");
        }

        if (!placeId) {
            throw new Error("장소 ID는 필수입니다");
        }

        return this.repository.removePlace(themeId, placeId, userId);
    }
}
