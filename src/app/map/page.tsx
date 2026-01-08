"use client"

import { useState } from "react";
import { MapContainer } from "@/presentation/components/Map/MapContainer";
import { PlaceSearch } from "@/presentation/components/Map/PlaceSearch";
import { Place } from "@/domain/types/place";
import { useItineraryStore } from "@/presentation/store/itineraryStore";
import { Plus } from "lucide-react";
import { RecommendationList } from "@/presentation/components/Recommendations/RecommendationList";
import { PlaceDetailsCard } from "@/presentation/components/Place/PlaceDetailsCard";

export default function MapPage() {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

    const handleMapLoad = (loadedMap: google.maps.Map) => {
        setMap(loadedMap);
    };

    const handlePlaceSelect = (place: Place) => {
        setSelectedPlace(place);
        if (map && place.location) {
            map.panTo(place.location);
            map.setZoom(15);

            new google.maps.Marker({
                position: place.location,
                map: map,
                title: place.name,
            });
        }
    };

    return (
        <div className="flex h-full flex-col gap-4 relative">
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-center pointer-events-none">
                <div className="pointer-events-auto w-full max-w-md">
                    <PlaceSearch map={map} onPlaceSelect={handlePlaceSelect} />
                </div>
            </div>

            <div className="flex-1 h-[calc(100vh-10rem)] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm dark:border-gray-800">
                <MapContainer onMapLoad={handleMapLoad} className="h-full w-full" />
            </div>

            {selectedPlace && (
                <div className="p-4 bg-white rounded-lg shadow border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h2 className="text-xl font-bold">{selectedPlace.name}</h2>
                            <p className="text-gray-500">{selectedPlace.address}</p>
                        </div>
                        <button
                            onClick={() => {
                                useItineraryStore.getState().addItem(selectedPlace);
                                alert("Added to itinerary!");
                            }}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Add to Itinerary
                        </button>
                    </div>

                    <PlaceDetailsCard place={selectedPlace} />

                    <div className="mt-4 border-t border-gray-100 pt-4 dark:border-zinc-800">
                        <RecommendationList place={selectedPlace} map={map} />
                    </div>
                </div>
            )}
        </div>
    );
}
