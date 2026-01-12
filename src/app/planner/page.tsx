"use client"
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { SavedItinerary, PlaceMemory } from "@/domain/types/itinerary";
import { PlannerCard } from "@/presentation/components/Planner/PlannerCard";
import { PlannerDetail } from "@/presentation/components/Planner/PlannerDetail";
import { groupItinerariesByStatus } from "@/domain/utils/dateUtils";

export default function PlannerPage() {
    const { data: session } = useSession();
    const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
    const [selectedItinerary, setSelectedItinerary] = useState<SavedItinerary | null>(null);

    const loadItineraries = async () => {
        if (!session?.user?.id) {
            setSavedItineraries([]);
            return;
        }

        try {
            const response = await fetch('/api/itineraries');
            if (!response.ok) {
                setSavedItineraries([]);
                return;
            }
            const result: SavedItinerary[] = await response.json();
            setSavedItineraries(result.reverse());
        } catch (error) {
            console.error("Failed to load itineraries:", error);
            setSavedItineraries([]);
        }
    };

    useEffect(() => {
        loadItineraries();
    }, [session]);

    const handleUpdateMemory = async (placeIndex: number, memory: PlaceMemory) => {
        if (!selectedItinerary || !session?.user?.id) return;

        const updatedItems = [...selectedItinerary.items];
        updatedItems[placeIndex] = {
            ...updatedItems[placeIndex],
            memory
        };

        const updatedItinerary = {
            ...selectedItinerary,
            items: updatedItems
        };

        try {
            const response = await fetch(`/api/itineraries/${selectedItinerary.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedItinerary),
            });

            if (response.ok) {
                setSelectedItinerary(updatedItinerary);
                loadItineraries();
            }
        } catch (error) {
            console.error("Failed to update memory:", error);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6 shrink-0">
                <h1 className="text-4xl font-bold font-[family-name:var(--font-caveat)] text-[#2C2724]">
                    {selectedItinerary ? "Travel Diary" : "My Trips"}
                </h1>
                <p className="text-[#78716C] italic">
                    {selectedItinerary ? "Capture your memories along the way." : "Select a journey to view details."}
                </p>
            </div>

            <div className="flex-1 min-h-0">
                {selectedItinerary ? (
                    <PlannerDetail
                        itinerary={selectedItinerary}
                        onBack={() => setSelectedItinerary(null)}
                        onUpdateMemory={handleUpdateMemory}
                    />
                ) : (
                    <>
                        {savedItineraries.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E2D0] rounded-sm text-[#78716C]">
                                <span className="text-4xl mb-2">✈️</span>
                                <p>No planned trips yet.</p>
                                <p className="text-sm mt-1">Go to Home to start a new journey!</p>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {(() => {
                                    const { ongoing, upcoming, past } = groupItinerariesByStatus(savedItineraries);

                                    return (
                                        <>
                                            {ongoing.length > 0 && (
                                                <section>
                                                    <h2 className="text-2xl font-bold font-[family-name:var(--font-caveat)] text-[#E09F3E] mb-4 flex items-center gap-2 animate-pulse">
                                                        <span>✈️</span> Happening Now
                                                    </h2>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                        {ongoing.map(itinerary => (
                                                            <PlannerCard
                                                                key={itinerary.id}
                                                                itinerary={itinerary}
                                                                onClick={() => setSelectedItinerary(itinerary)}
                                                            />
                                                        ))}
                                                    </div>
                                                </section>
                                            )}

                                            {upcoming.length > 0 && (
                                                <section>
                                                    <h2 className="text-2xl font-bold font-[family-name:var(--font-caveat)] text-[#2C2724] mb-4 flex items-center gap-2">
                                                        <span>🚀</span> Upcoming Adventures
                                                    </h2>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                        {upcoming.map(itinerary => (
                                                            <PlannerCard
                                                                key={itinerary.id}
                                                                itinerary={itinerary}
                                                                onClick={() => setSelectedItinerary(itinerary)}
                                                            />
                                                        ))}
                                                    </div>
                                                </section>
                                            )}

                                            {past.length > 0 && (
                                                <section>
                                                    <h2 className="text-2xl font-bold font-[family-name:var(--font-caveat)] text-[#78716C] mb-4 flex items-center gap-2 opacity-80">
                                                        <span>📔</span> Past Journeys
                                                    </h2>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-90 hover:opacity-100 transition-opacity">
                                                        {past.map(itinerary => (
                                                            <PlannerCard
                                                                key={itinerary.id}
                                                                itinerary={itinerary}
                                                                onClick={() => setSelectedItinerary(itinerary)}
                                                            />
                                                        ))}
                                                    </div>
                                                </section>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
