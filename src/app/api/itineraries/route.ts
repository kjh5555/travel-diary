import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaItineraryRepository } from "@/data/repositories/PrismaItineraryRepository";

const repository = new PrismaItineraryRepository();

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const itineraries = await repository.getAllTripItineraries(session.user.id);
    return NextResponse.json(itineraries);
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await repository.saveTripItinerary(body, session.user.id);

    return NextResponse.json({ success: true }, { status: 201 });
}
