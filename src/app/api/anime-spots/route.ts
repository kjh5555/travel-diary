import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaAnimeSpotRepository } from "@/data/repositories/PrismaAnimeSpotRepository";

const repository = new PrismaAnimeSpotRepository();

export async function GET() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const spots = await repository.getAll(userId);
    return NextResponse.json(spots);
}
