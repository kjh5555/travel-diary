import { IThemeSpotRepository } from "@/domain/repositories/IThemeSpotRepository";
import { ThemeSpot, ThemeCategoryId, ThemeSubCategory } from "@/domain/types/themeSpot";

export class FilterThemeSpotsBySubCategoryUseCase {
    constructor(private repository: IThemeSpotRepository) {}

    async execute(themeId: ThemeCategoryId, subCategory: ThemeSubCategory): Promise<ThemeSpot[]> {
        return this.repository.getBySubCategory(themeId, subCategory);
    }
}
