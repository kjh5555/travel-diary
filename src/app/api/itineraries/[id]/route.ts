import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaItineraryRepository } from "@/data/repositories/PrismaItineraryRepository";

const repository = new PrismaItineraryRepository();

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const itinerary = await repository.getTripItinerary(id, session.user.id);

    if (!itinerary) {
        return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
    }

    return NextResponse.json(itinerary);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (body.id !== id) {
        return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
    }

    await repository.saveTripItinerary(body, session.user.id);

    return NextResponse.json({ success: true });
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await repository.deleteTripItinerary(id, session.user.id);

    return NextResponse.json({ success: true });
}
