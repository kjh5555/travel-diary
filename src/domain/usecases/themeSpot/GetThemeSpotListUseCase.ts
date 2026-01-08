import { IThemeSpotRepository } from "@/domain/repositories/IThemeSpotRepository";
import { ThemeSpot, ThemeCategoryId } from "@/domain/types/themeSpot";

export class GetThemeSpotListUseCase {
    constructor(private repository: IThemeSpotRepository) {}

    async execute(themeId?: ThemeCategoryId): Promise<ThemeSpot[]> {
        if (themeId) {
            return this.repository.getByTheme(themeId);
        }
        return this.repository.getAll();
    }
}
