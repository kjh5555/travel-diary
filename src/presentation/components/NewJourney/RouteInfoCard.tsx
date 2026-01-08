import React from 'react';
import { Route } from "@/domain/types/itinerary";

interface RouteInfoCardProps {
    route: Route;
}

export const RouteInfoCard: React.FC<RouteInfoCardProps> = ({ route }) => {
    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.ceil((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}시간 ${minutes}분`;
        }
        return `${minutes}분`;
    };

    const formatDistance = (meters: number) => {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)}km`;
        }
        return `${meters}m`;
    };

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'TRANSIT':
                return 'subway';
            case 'DRIVING':
                return 'local_taxi';
            case 'WALKING':
                return 'directions_walk';
            case 'BICYCLING':
                return 'directions_bike';
            default:
                return 'route';
        }
    };

    const getModeLabel = (mode: string) => {
        switch (mode) {
            case 'TRANSIT':
                return '대중교통';
            case 'DRIVING':
                return '차량';
            case 'WALKING':
                return '도보';
            case 'BICYCLING':
                return '자전거';
            default:
                return '이동';
        }
    };

    const hasDetailedSteps = route.steps && route.steps.length > 0;
    const transitSteps = route.steps?.filter(step => step.mode === 'TRANSIT' && step.transit) || [];

    return (
        <div className="ml-4 mt-4 bg-[var(--secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
            <div className="flex items-center gap-3 p-3 bg-[var(--surface)]">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${route.mode === 'TRANSIT' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                        route.mode === 'DRIVING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                            'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    }`}>
                    <span className="material-symbols-outlined text-lg">{getModeIcon(route.mode)}</span>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--primary)]">{formatDuration(route.durationSeconds)}</span>
                        <span className="text-[var(--muted-foreground)]">•</span>
                        <span className="text-sm text-[var(--muted-foreground)]">{formatDistance(route.distanceMeters)}</span>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">{getModeLabel(route.mode)}</div>
                </div>
                {route.isFallback && (
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                        대체 경로
                    </span>
                )}
            </div>

            {transitSteps.length > 0 && (
                <div className="p-3 space-y-2">
                    {transitSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                            {step.transit?.line?.vehicle?.type && (
                                <span className="material-symbols-outlined text-base" style={{
                                    color: step.transit?.line?.color || 'var(--muted-foreground)'
                                }}>
                                    {step.transit.line.vehicle.type === 'SUBWAY' ? 'subway' :
                                        step.transit.line.vehicle.type === 'BUS' ? 'directions_bus' :
                                            step.transit.line.vehicle.type === 'RAIL' ? 'train' : 'tram'}
                                </span>
                            )}
                            <div
                                className="px-2 py-0.5 rounded text-xs font-bold text-white"
                                style={{ backgroundColor: step.transit?.line?.color || '#666' }}
                            >
                                {step.transit?.line?.short_name || step.transit?.line?.name || '노선'}
                            </div>
                            {step.transit?.departure_stop && step.transit?.arrival_stop && (
                                <span className="text-[var(--muted-foreground)] text-xs">
                                    {step.transit.departure_stop} → {step.transit.arrival_stop}
                                </span>
                            )}
                            {step.transit?.num_stops && (
                                <span className="text-xs text-[var(--muted-foreground)]">
                                    ({step.transit.num_stops}정거장)
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* {hasDetailedSteps && transitSteps.length === 0 && (
                <div className="px-3 pb-3">
                    <div className="text-xs text-[var(--muted-foreground)]">
                        {route.steps.length}단계 경로
                    </div>
                </div>
            )} */}
        </div>
    );
};
