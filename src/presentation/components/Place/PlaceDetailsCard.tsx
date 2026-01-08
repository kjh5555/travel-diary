import { Place } from "@/domain/types/place";
import { Clock, DollarSign } from "lucide-react";

interface PlaceDetailsCardProps {
    place: Place;
}

export const PlaceDetailsCard = ({ place }: PlaceDetailsCardProps) => {
    const isOpen = place.opening_hours?.open_now;
    const priceLevel = place.price_level;

    return (
        <div className="mt-2 flex items-center gap-4 text-sm">
            {place.opening_hours && (
                <div className={`flex items-center gap-1 font-medium ${isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    <Clock className="h-4 w-4" />
                    <span>{isOpen ? "Open Now" : "Closed"}</span>
                </div>
            )}

            {priceLevel !== undefined && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <DollarSign
                            key={i}
                            className={`h-3 w-3 ${i < priceLevel ? 'text-black dark:text-white' : 'text-gray-300 dark:text-zinc-700'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
