import { 
    CustomTheme, 
    CreateCustomThemeInput, 
    UpdateCustomThemeInput,
    CustomThemePlace 
} from "../types/customTheme";
import { Place } from "../types/place";

export interface ICustomThemeRepository {
    getAll(): Promise<CustomTheme[]>;
    getById(id: string): Promise<CustomTheme | null>;
    create(input: CreateCustomThemeInput): Promise<CustomTheme>;
    update(id: string, input: UpdateCustomThemeInput): Promise<CustomTheme | null>;
    delete(id: string): Promise<boolean>;
    addPlace(themeId: string, place: Place, note?: string): Promise<CustomThemePlace | null>;
    removePlace(themeId: string, placeId: string): Promise<boolean>;
    updatePlaceNote(themeId: string, placeId: string, note: string): Promise<CustomThemePlace | null>;
}
