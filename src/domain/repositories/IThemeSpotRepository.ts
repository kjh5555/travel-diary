import { ThemeSpot, ThemeCategoryId, ThemeSubCategory } from "../types/themeSpot";

export interface IThemeSpotRepository {
    getAll(): Promise<ThemeSpot[]>;
    getById(id: string): Promise<ThemeSpot | null>;
    getByTheme(themeId: ThemeCategoryId): Promise<ThemeSpot[]>;
    getBySubCategory(themeId: ThemeCategoryId, subCategory: ThemeSubCategory): Promise<ThemeSpot[]>;
    search(query: string, themeId?: ThemeCategoryId): Promise<ThemeSpot[]>;
    toggleLike(id: string): Promise<ThemeSpot | null>;
}
