import { ICustomThemeRepository } from "@/domain/repositories/ICustomThemeRepository";
import { 
    CustomTheme, 
    CreateCustomThemeInput, 
    UpdateCustomThemeInput,
    CustomThemePlace,
    DEFAULT_THEME_COLOR,
    DEFAULT_THEME_ICON
} from "@/domain/types/customTheme";
import { Place } from "@/domain/types/place";

const STORAGE_KEY = "custom_themes";

export class LocalStorageCustomThemeRepository implements ICustomThemeRepository {
    private generateId(): string {
        return `theme_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    private generatePlaceId(): string {
        return `place_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    async getAll(_userId: string): Promise<CustomTheme[]> {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data) as CustomTheme[];
        } catch {
            return [];
        }
    }

    async getById(id: string, _userId: string): Promise<CustomTheme | null> {
        const themes = await this.getAll(_userId);
        return themes.find(t => t.id === id) || null;
    }

    async create(input: CreateCustomThemeInput, _userId: string): Promise<CustomTheme> {
        const themes = await this.getAll(_userId);
        const now = new Date().toISOString();
        
        const newTheme: CustomTheme = {
            id: this.generateId(),
            name: input.name,
            description: input.description,
            coverImage: input.coverImage,
            color: input.color || DEFAULT_THEME_COLOR.value,
            icon: input.icon || DEFAULT_THEME_ICON,
            places: [],
            createdAt: now,
            updatedAt: now,
        };

        themes.push(newTheme);
        this.save(themes);
        return newTheme;
    }

    async update(id: string, input: UpdateCustomThemeInput, _userId: string): Promise<CustomTheme | null> {
        const themes = await this.getAll(_userId);
        const index = themes.findIndex(t => t.id === id);
        if (index === -1) return null;

        const updated: CustomTheme = {
            ...themes[index],
            ...input,
            updatedAt: new Date().toISOString(),
        };

        themes[index] = updated;
        this.save(themes);
        return updated;
    }

    async delete(id: string, _userId: string): Promise<boolean> {
        const themes = await this.getAll(_userId);
        const filtered = themes.filter(t => t.id !== id);
        if (filtered.length === themes.length) return false;
        
        this.save(filtered);
        return true;
    }

    async addPlace(themeId: string, place: Place, _userId: string, note?: string): Promise<CustomThemePlace | null> {
        const themes = await this.getAll(_userId);
        const theme = themes.find(t => t.id === themeId);
        if (!theme) return null;

        const existingPlace = theme.places.find(p => p.place.id === place.id);
        if (existingPlace) return existingPlace;

        const newPlace: CustomThemePlace = {
            id: this.generatePlaceId(),
            place,
            note,
            addedAt: new Date().toISOString(),
        };

        theme.places.push(newPlace);
        theme.updatedAt = new Date().toISOString();

        if (!theme.coverImage && place.photos && place.photos.length > 0) {
            theme.coverImage = place.photos[0];
        }

        this.save(themes);
        return newPlace;
    }

    async removePlace(themeId: string, placeId: string, _userId: string): Promise<boolean> {
        const themes = await this.getAll(_userId);
        const theme = themes.find(t => t.id === themeId);
        if (!theme) return false;

        const initialLength = theme.places.length;
        theme.places = theme.places.filter(p => p.place.id !== placeId);
        
        if (theme.places.length === initialLength) return false;

        theme.updatedAt = new Date().toISOString();
        this.save(themes);
        return true;
    }

    async updatePlaceNote(themeId: string, placeId: string, note: string, _userId: string): Promise<CustomThemePlace | null> {
        const themes = await this.getAll(_userId);
        const theme = themes.find(t => t.id === themeId);
        if (!theme) return null;

        const place = theme.places.find(p => p.place.id === placeId);
        if (!place) return null;

        place.note = note;
        theme.updatedAt = new Date().toISOString();
        this.save(themes);
        return place;
    }

    private save(themes: CustomTheme[]): void {
        if (typeof window === "undefined") return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
    }
}
