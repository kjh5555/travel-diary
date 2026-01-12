import { ICustomThemeRepository } from "@/domain/repositories/ICustomThemeRepository";
import { CustomTheme } from "@/domain/types/customTheme";

export class GetCustomThemesUseCase {
    constructor(private repository: ICustomThemeRepository) {}

    async execute(userId: string): Promise<CustomTheme[]> {
        if (!userId || userId.trim().length === 0) {
            throw new Error("User ID is required");
        }
        return this.repository.getAll(userId);
    }
}
