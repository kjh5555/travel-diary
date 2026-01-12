import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaCustomThemeRepository } from "@/data/repositories/PrismaCustomThemeRepository";

const repository = new PrismaCustomThemeRepository();

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: themeId } = await params;
    const body = await request.json();
    const { place, note } = body;

    if (!place) {
        return NextResponse.json({ error: "Place is required" }, { status: 400 });
    }

    const result = await repository.addPlace(themeId, place, session.user.id, note);

    if (!result) {
        return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    return NextResponse.json(result, { status: 201 });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: themeId } = await params;
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');

    if (!placeId) {
        return NextResponse.json({ error: "placeId is required" }, { status: 400 });
    }

    const deleted = await repository.removePlace(themeId, placeId, session.user.id);

    if (!deleted) {
        return NextResponse.json({ error: "Theme or place not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
