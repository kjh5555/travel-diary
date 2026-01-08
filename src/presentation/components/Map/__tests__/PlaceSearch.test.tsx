import { describe, it, expect, vi } from 'vitest';
import { PlaceSearch } from '../PlaceSearch';

// Mock dependencies
vi.mock('@/domain/usecases/place/SearchPlacesUseCase');
vi.mock('@/data/repositories/GooglePlaceRepository');

describe('PlaceSearch', () => {
    it('should be defined', () => {
        expect(PlaceSearch).toBeDefined();
    });

    it('should be a function component', () => {
        expect(typeof PlaceSearch).toBe('function');
    });
});
