import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaItineraryRepository } from "@/data/repositories/PrismaItineraryRepository";
import { PrismaJourneyShareRepository } from "@/data/repositories/PrismaJourneyShareRepository";
import prisma from "@/lib/prisma";

const repository = new PrismaItineraryRepository();
const shareRepository = new PrismaJourneyShareRepository();

async function getItineraryOwner(itineraryId: string): Promise<string | null> {
    const itinerary = await prisma.savedItinerary.findUnique({
        where: { id: itineraryId },
        select: { userId: true }
    });
    return itinerary?.userId || null;
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    let itinerary = await repository.getTripItinerary(id, session.user.id);
    
    if (!itinerary) {
        const access = await shareRepository.hasAccess(id, session.user.id);
        if (access.hasAccess) {
            itinerary = await shareRepository.getSharedJourney(id, session.user.id);
        }
    }

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

    try {
        const { id } = await params;
        const body = await request.json();

        if (body.id !== id) {
            return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
        }

        const existingOwned = await repository.getTripItinerary(id, session.user.id);
        
        if (existingOwned) {
            await repository.saveTripItinerary(body, session.user.id, session.user.id);
            return NextResponse.json({ success: true });
        }

        const access = await shareRepository.hasAccess(id, session.user.id);
        if (!access.hasAccess) {
            return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
        }
        
        if (access.permission !== 'EDIT') {
            return NextResponse.json({ error: "편집 권한이 없습니다." }, { status: 403 });
        }

        const originalOwner = await getItineraryOwner(id);
        if (!originalOwner) {
            return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
        }

        await repository.saveTripItinerary(body, originalOwner, session.user.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update itinerary:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "업데이트에 실패했습니다." },
            { status: 500 }
        );
    }
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
