import { ICustomThemeRepository } from "@/domain/repositories/ICustomThemeRepository";
import { UpdateCustomThemeInput, CustomTheme } from "@/domain/types/customTheme";

export class UpdateCustomThemeUseCase {
    constructor(private repository: ICustomThemeRepository) {}

    async execute(id: string, input: UpdateCustomThemeInput, userId: string): Promise<CustomTheme | null> {
        if (!id) {
            throw new Error("테마 ID는 필수입니다");
        }
        if (!userId) {
            throw new Error("User ID is required");
        }

        if (input.name !== undefined) {
            if (input.name.trim().length === 0) {
                throw new Error("테마 이름은 비워둘 수 없습니다");
            }
            if (input.name.trim().length > 50) {
                throw new Error("테마 이름은 50자 이하여야 합니다");
            }
        }

        return this.repository.update(id, {
            ...input,
            name: input.name?.trim(),
            description: input.description?.trim(),
        }, userId);
    }
}
