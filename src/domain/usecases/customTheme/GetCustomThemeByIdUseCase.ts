import { ICustomThemeRepository } from "@/domain/repositories/ICustomThemeRepository";
import { CustomTheme } from "@/domain/types/customTheme";

export class GetCustomThemeByIdUseCase {
    constructor(private repository: ICustomThemeRepository) {}

    async execute(id: string, userId: string): Promise<CustomTheme | null> {
        if (!id) {
            throw new Error("테마 ID는 필수입니다");
        }
        if (!userId) {
            throw new Error("User ID is required");
        }
        return this.repository.getById(id, userId);
    }
}
