import { IThemeSpotRepository } from "@/domain/repositories/IThemeSpotRepository";
import { ThemeSpot } from "@/domain/types/themeSpot";

export class ToggleThemeSpotLikeUseCase {
    constructor(private repository: IThemeSpotRepository) {}

    async execute(id: string): Promise<ThemeSpot | null> {
        if (!id || id.trim().length === 0) {
            throw new Error("Spot ID cannot be empty");
        }
        return this.repository.toggleLike(id);
    }
}
