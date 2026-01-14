import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaJourneyShareRepository } from "@/data/repositories/PrismaJourneyShareRepository";
import { GetSharedJourneysUseCase } from "@/domain/usecases/journeyShare/GetSharedJourneysUseCase";

const repository = new PrismaJourneyShareRepository();

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const useCase = new GetSharedJourneysUseCase(repository);
        const sharedJourneys = await useCase.executeSharedWithMeFull(session.user.id);

        return NextResponse.json(sharedJourneys);
    } catch (error) {
        console.error("Get shared journeys error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "공유받은 여정을 가져오는데 실패했습니다." },
            { status: 500 }
        );
    }
}
