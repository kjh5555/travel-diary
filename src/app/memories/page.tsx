"use client"
import { useEffect, useState } from "react";
import { LocalStorageItineraryRepository } from "@/data/repositories/LocalStorageItineraryRepository";
import { GetTripItinerariesUseCase } from "@/domain/usecases/itinerary/GetTripItinerariesUseCase";
import { SavedItineraryPlace } from "@/domain/types/itinerary";
import { PlaceImage } from "@/presentation/components/Place/PlaceImage";

export default function MemoriesPage() {
    const [likedPlaces, setLikedPlaces] = useState<SavedItineraryPlace[]>([]);

    useEffect(() => {
        const loadMemories = async () => {
            const repository = new LocalStorageItineraryRepository();
            const useCase = new GetTripItinerariesUseCase(repository);
            const itineraries = await useCase.execute();

            const allLiked: SavedItineraryPlace[] = [];
            itineraries.forEach(trip => {
                trip.items.forEach(item => {
                    if (item.memory?.isLiked) {
                        allLiked.push(item);
                    }
                });
            });
            setLikedPlaces(allLiked.reverse()); // Newest first
        };
        loadMemories();
    }, []);

    // Grouping Logic
    const groupedPlaces = likedPlaces.reduce((acc, item) => {
        // Simplified categorization based on types or default to 'Other'
        const rawTypes = item.place.types || [];

        let category = "Others";
        if (rawTypes.includes("restaurant") || rawTypes.includes("food") || rawTypes.includes("cafe") || rawTypes.includes("bar")) {
            category = "Food & Drink 🍽️";
        } else if (rawTypes.includes("lodging") || rawTypes.includes("hotel")) {
            category = "Stay 🏨";
        } else if (rawTypes.includes("tourist_attraction") || rawTypes.includes("museum") || rawTypes.includes("park")) {
            category = "Attractions 🎡";
        } else if (rawTypes.includes("shopping_mall") || rawTypes.includes("store")) {
            category = "Shopping 🛍️";
        }

        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {} as Record<string, SavedItineraryPlace[]>);


    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-10 text-center">
                <h1 className="text-5xl font-bold font-[family-name:var(--font-caveat)] text-[#2C2724] drop-shadow-sm">
                    My Memories
                </h1>
                <p className="text-lg text-[#78716C] italic font-medium mt-2">
                    "Collect moments, not things."
                </p>
            </div>

            {Object.keys(groupedPlaces).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#E5E2D0] rounded-sm text-[#78716C]">
                    <span className="text-4xl mb-4">❤️</span>
                    <p className="text-xl font-[family-name:var(--font-caveat)]">No favorite moments yet.</p>
                    <p className="text-sm mt-2">Go to your Planner and 'Like' the places you loved!</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {Object.entries(groupedPlaces).map(([category, items]) => (
                        <div key={category}>
                            <h2 className="text-3xl font-bold font-[family-name:var(--font-caveat)] text-[#E09F3E] mb-6 border-b-2 border-[#E5E2D0] pb-2 inline-block">
                                {category}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {items.map((item, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-sm shadow-md border border-[#E5E2D0] hover:shadow-xl transition-shadow group relative">
                                        {/* Tape */}
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-red-100/50 rotate-[-2deg] shadow-sm backdrop-blur-sm z-10"></div>

                                        <div className="aspect-square bg-gray-100 mb-3 overflow-hidden rounded-sm relative">
                                            {item.memory?.images && item.memory.images.length > 0 ? (
                                                <img src={item.memory.images[0]} alt={item.place.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            ) : (
                                                <PlaceImage placeName={item.place.name} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                                            )}

                                            {/* Heart Overlay */}
                                            <div className="absolute top-2 right-2 bg-white/80 p-1 rounded-full shadow-sm text-xs">❤️</div>
                                        </div>

                                        <div className="text-center">
                                            <h3 className="font-bold text-[#2C2724] truncate px-1">{item.place.name}</h3>
                                            <p className="text-xs text-[#78716C] truncate mt-1">{item.place.address}</p>
                                            {item.memory?.text && (
                                                <div className="mt-3 p-2 bg-[#FDFCF0] text-xs text-[#78716C] font-[family-name:var(--font-caveat)] text-left line-clamp-2 border border-[#E5E2D0]/50 rounded-sm">
                                                    "{item.memory.text}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
