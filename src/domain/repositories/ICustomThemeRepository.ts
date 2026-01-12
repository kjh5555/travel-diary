import { 
    CustomTheme, 
    CreateCustomThemeInput, 
    UpdateCustomThemeInput,
    CustomThemePlace 
} from "../types/customTheme";
import { Place } from "../types/place";

export interface ICustomThemeRepository {
    getAll(userId: string): Promise<CustomTheme[]>;
    getById(id: string, userId: string): Promise<CustomTheme | null>;
    create(input: CreateCustomThemeInput, userId: string): Promise<CustomTheme>;
    update(id: string, input: UpdateCustomThemeInput, userId: string): Promise<CustomTheme | null>;
    delete(id: string, userId: string): Promise<boolean>;
    addPlace(themeId: string, place: Place, userId: string, note?: string): Promise<CustomThemePlace | null>;
    removePlace(themeId: string, placeId: string, userId: string): Promise<boolean>;
    updatePlaceNote(themeId: string, placeId: string, note: string, userId: string): Promise<CustomThemePlace | null>;
}
