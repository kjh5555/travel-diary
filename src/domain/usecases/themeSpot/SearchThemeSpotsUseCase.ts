import { IThemeSpotRepository } from "@/domain/repositories/IThemeSpotRepository";
import { ThemeSpot, ThemeCategoryId } from "@/domain/types/themeSpot";

export class SearchThemeSpotsUseCase {
    constructor(private repository: IThemeSpotRepository) {}

    async execute(query: string, themeId?: ThemeCategoryId): Promise<ThemeSpot[]> {
        if (!query || query.trim().length === 0) {
            if (themeId) {
                return this.repository.getByTheme(themeId);
            }
            return this.repository.getAll();
        }
        return this.repository.search(query.trim(), themeId);
    }
}
