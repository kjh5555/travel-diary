import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaThemeSpotRepository } from "@/data/repositories/PrismaThemeSpotRepository";
import { ThemeCategoryId } from "@/domain/types/themeSpot";

const repository = new PrismaThemeSpotRepository();

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const themeId = searchParams.get("themeId") as ThemeCategoryId | null;

    const spots = themeId
        ? await repository.getByTheme(themeId, userId)
        : await repository.getAll(userId);

    return NextResponse.json(spots);
}
