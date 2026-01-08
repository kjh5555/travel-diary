"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SavedItinerary, PlaceMemory } from "@/domain/types/itinerary";
import { LocalStorageItineraryRepository } from "@/data/repositories/LocalStorageItineraryRepository";
import { GetTripItineraryUseCase } from "@/domain/usecases/itinerary/GetTripItineraryUseCase";
import { UpdateTripMemoryUseCase } from "@/domain/usecases/itinerary/UpdateTripMemoryUseCase";
import { CompletedJourneyDetail } from "@/presentation/components/Journey/CompletedJourneyDetail";
import { OngoingJourneyDetail } from "@/presentation/components/Journey/OngoingJourneyDetail";
import { getItineraryStatus } from "@/domain/utils/dateUtils";

export default function JourneyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [itinerary, setItinerary] = useState<SavedItinerary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadItinerary = async () => {
        if (!params.id || typeof params.id !== 'string') return;

        setIsLoading(true);
        try {
            const repository = new LocalStorageItineraryRepository();
            const useCase = new GetTripItineraryUseCase(repository);
            const result = await useCase.execute(params.id);
            setItinerary(result);
        } catch (error) {
            console.error("Failed to load itinerary:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadItinerary();
    }, [params.id]);

    const handleUpdateMemory = async (placeIndex: number, memory: PlaceMemory) => {
        if (!itinerary) return;

        const updatedItems = [...itinerary.items];
        updatedItems[placeIndex] = {
            ...updatedItems[placeIndex],
            memory
        };

        const updatedItinerary = {
            ...itinerary,
            items: updatedItems
        };

        const repository = new LocalStorageItineraryRepository();
        const updateUseCase = new UpdateTripMemoryUseCase(repository);
        await updateUseCase.execute(itinerary.id, updatedItinerary);

        setItinerary(updatedItinerary);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full">
                <div className="flex-1 flex flex-col h-full overflow-y-auto">
                    <div className="w-full h-64 md:h-80 bg-[var(--secondary)] animate-pulse" />
                    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">
                        <div className="h-12 w-64 bg-[var(--secondary)] rounded animate-pulse mb-4" />
                        <div className="h-8 w-48 bg-[var(--secondary)] rounded animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!itinerary) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <span className="material-symbols-outlined text-6xl text-[var(--muted-foreground)]/50 mb-4">
                    error_outline
                </span>
                <h2 className="text-2xl font-bold mb-2">여정을 찾을 수 없어요</h2>
                <p className="text-[var(--muted-foreground)] mb-6">요청하신 여행 일정이 존재하지 않습니다.</p>
                <Link
                    href="/journeys"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-semibold hover:bg-[var(--primary-dark)] transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    목록으로 돌아가기
                </Link>
            </div>
        );
    }

    const journeyStatus = getItineraryStatus(itinerary.startDate, itinerary.endDate);

    const handleUpdateCoverImage = async (coverImage: string, thumbnail?: string) => {
        if (!itinerary) return;
        
        const updatedItinerary = { ...itinerary, coverImage, thumbnail };
        const repository = new LocalStorageItineraryRepository();
        const updateUseCase = new UpdateTripMemoryUseCase(repository);
        await updateUseCase.execute(itinerary.id, updatedItinerary);
        setItinerary(updatedItinerary);
    };

    const handleUpdateItinerary = async (updatedItinerary: SavedItinerary) => {
        const repository = new LocalStorageItineraryRepository();
        const updateUseCase = new UpdateTripMemoryUseCase(repository);
        await updateUseCase.execute(updatedItinerary.id, updatedItinerary);
        setItinerary(updatedItinerary);
    };

    if (journeyStatus === 'ongoing') {
        return (
            <OngoingJourneyDetail
                itinerary={itinerary}
                onBack={() => router.push('/journeys')}
                onUpdateMemory={handleUpdateMemory}
                onUpdateCoverImage={handleUpdateCoverImage}
                onUpdateItinerary={handleUpdateItinerary}
            />
        );
    }

    if (journeyStatus === 'past') {
        return (
            <CompletedJourneyDetail
                itinerary={itinerary}
                onBack={() => router.push('/journeys')}
                onUpdateMemory={handleUpdateMemory}
                onUpdateCoverImage={handleUpdateCoverImage}
            />
        );
    }

    router.push(`/journeys/${itinerary.id}/edit`);
    return null;
}
