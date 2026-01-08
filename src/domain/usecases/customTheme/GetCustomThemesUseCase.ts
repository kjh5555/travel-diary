import { ICustomThemeRepository } from "@/domain/repositories/ICustomThemeRepository";
import { CustomTheme } from "@/domain/types/customTheme";

export class GetCustomThemesUseCase {
    constructor(private repository: ICustomThemeRepository) {}

    async execute(): Promise<CustomTheme[]> {
        return this.repository.getAll();
    }
}
