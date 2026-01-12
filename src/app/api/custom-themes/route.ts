import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaCustomThemeRepository } from "@/data/repositories/PrismaCustomThemeRepository";

const repository = new PrismaCustomThemeRepository();

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const themes = await repository.getAll(session.user.id);
    return NextResponse.json(themes);
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const theme = await repository.create(body, session.user.id);

    return NextResponse.json(theme, { status: 201 });
}
