import { ICustomThemeRepository } from "@/domain/repositories/ICustomThemeRepository";
import { CreateCustomThemeInput, CustomTheme } from "@/domain/types/customTheme";

export class CreateCustomThemeUseCase {
    constructor(private repository: ICustomThemeRepository) {}

    async execute(input: CreateCustomThemeInput, userId: string): Promise<CustomTheme> {
        if (!userId || userId.trim().length === 0) {
            throw new Error("User ID is required");
        }
        if (!input.name || input.name.trim().length === 0) {
            throw new Error("테마 이름은 필수입니다");
        }

        if (input.name.trim().length > 50) {
            throw new Error("테마 이름은 50자 이하여야 합니다");
        }

        return this.repository.create({
            ...input,
            name: input.name.trim(),
            description: input.description?.trim(),
        }, userId);
    }
}
