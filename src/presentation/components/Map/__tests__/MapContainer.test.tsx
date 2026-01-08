import { describe, it, expect, vi } from 'vitest';
import { MapContainer } from '../MapContainer';

// Mock useGoogleMaps hook
vi.mock('@/data/google-maps/useGoogleMaps');

describe('MapContainer', () => {
    it('should be defined', () => {
        expect(MapContainer).toBeDefined();
    });

    it('should be a function component', () => {
        expect(typeof MapContainer).toBe('function');
    });
});
