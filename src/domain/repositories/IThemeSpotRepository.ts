import { ThemeSpot, ThemeCategoryId, ThemeSubCategory } from "../types/themeSpot";

export interface IThemeSpotRepository {
    getAll(userId?: string): Promise<ThemeSpot[]>;
    getById(id: string, userId?: string): Promise<ThemeSpot | null>;
    getByTheme(themeId: ThemeCategoryId, userId?: string): Promise<ThemeSpot[]>;
    getBySubCategory(themeId: ThemeCategoryId, subCategory: ThemeSubCategory, userId?: string): Promise<ThemeSpot[]>;
    search(query: string, themeId?: ThemeCategoryId, userId?: string): Promise<ThemeSpot[]>;
    toggleLike(id: string, userId: string): Promise<ThemeSpot | null>;
    getLikedByUser(userId: string): Promise<ThemeSpot[]>;
}
