import { IAnimeSpotRepository } from "@/domain/repositories/IAnimeSpotRepository";
import { AnimeSpot, AnimeCategory } from "@/domain/types/animeSpot";

const STORAGE_KEY = "anime_spots_likes";

const SEED_DATA: AnimeSpot[] = [
    {
        id: "1",
        title: "너의 이름은",
        sceneName: "스가 신사 계단",
        originalImageUrl: "/images/anime/your-name-stairs.jpg",
        lat: 35.6762,
        lng: 139.7650,
        guideTip: "해질녘에 방문하면 영화 속 장면을 재현할 수 있습니다. 계단 중간에서 촬영하세요.",
        category: "romance",
        rating: 4.9,
        location: "도쿄, 일본",
        description: "미츠하와 타키가 마지막에 재회하는 감동적인 장면의 배경이 된 장소입니다."
    },
    {
        id: "2",
        title: "센과 치히로의 행방불명",
        sceneName: "유바바의 온천",
        originalImageUrl: "/images/anime/spirited-away-bathhouse.jpg",
        lat: 36.5613,
        lng: 136.8866,
        guideTip: "밤에 조명이 켜지면 더욱 환상적입니다. 주변 온천마을도 함께 둘러보세요.",
        category: "ghibli",
        rating: 4.8,
        location: "가나자와, 일본",
        description: "지브리 스튜디오의 명작 속 온천장의 모티브가 된 곳입니다."
    },
    {
        id: "3",
        title: "슬램덩크",
        sceneName: "가마쿠라 건널목",
        originalImageUrl: "/images/anime/slam-dunk-crossing.jpg",
        lat: 35.3066,
        lng: 139.4940,
        guideTip: "에노덴 열차가 지나가는 순간을 포착하세요. 오전 시간대가 인파가 적습니다.",
        category: "sports",
        rating: 4.7,
        location: "가마쿠라, 일본",
        description: "오프닝에 등장하는 유명한 건널목 장면입니다."
    },
    {
        id: "4",
        title: "날씨의 아이",
        sceneName: "시부야 하늘 정원",
        originalImageUrl: "/images/anime/weathering-with-you-garden.jpg",
        lat: 35.6580,
        lng: 139.7016,
        guideTip: "비 오는 날 방문하면 영화의 분위기를 더 잘 느낄 수 있습니다.",
        category: "shinkai",
        rating: 4.6,
        location: "도쿄, 일본",
        description: "히나가 맑은 날씨를 기원하는 장면의 배경입니다."
    },
    {
        id: "5",
        title: "하울의 움직이는 성",
        sceneName: "콜마르 마을",
        originalImageUrl: "/images/anime/howls-castle-town.jpg",
        lat: 48.0794,
        lng: 7.3582,
        guideTip: "구시가지의 프티 베니스 지역이 가장 영화와 비슷합니다.",
        category: "ghibli",
        rating: 4.8,
        location: "콜마르, 프랑스",
        description: "소피가 살던 마을의 모티브가 된 동화 같은 도시입니다."
    },
    {
        id: "6",
        title: "주술회전",
        sceneName: "시부야역 스크램블 교차로",
        originalImageUrl: "/images/anime/jjk-shibuya.jpg",
        lat: 35.6595,
        lng: 139.7004,
        guideTip: "시부야 사변 아크의 배경입니다. 야경 촬영을 추천합니다.",
        category: "action",
        rating: 4.5,
        location: "도쿄, 일본",
        description: "시부야 사변의 격전지였던 곳입니다."
    },
    {
        id: "7",
        title: "모노노케 히메",
        sceneName: "야쿠시마 숲",
        originalImageUrl: "/images/anime/mononoke-forest.jpg",
        lat: 30.3475,
        lng: 130.5578,
        guideTip: "조몬 삼나무까지 등산은 체력이 필요합니다. 여유로운 일정을 잡으세요.",
        category: "ghibli",
        rating: 4.9,
        location: "야쿠시마, 일본",
        description: "시시가미의 숲의 모티브가 된 신비로운 원시림입니다."
    },
    {
        id: "8",
        title: "스즈메의 문단속",
        sceneName: "규슈 폐허 학교",
        originalImageUrl: "/images/anime/suzume-school.jpg",
        lat: 32.8031,
        lng: 130.7079,
        guideTip: "실제 촬영지는 사유지입니다. 원경으로만 촬영하세요.",
        category: "shinkai",
        rating: 4.4,
        location: "구마모토, 일본",
        description: "스즈메가 처음 문을 발견한 폐허의 모티브입니다."
    }
];

export class LocalStorageAnimeSpotRepository implements IAnimeSpotRepository {
    private getLikedIds(): string[] {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    private saveLikedIds(ids: string[]): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }

    private enrichWithLikes(spots: AnimeSpot[]): AnimeSpot[] {
        const likedIds = this.getLikedIds();
        return spots.map(spot => ({
            ...spot,
            isLiked: likedIds.includes(spot.id)
        }));
    }

    async getAll(_userId?: string): Promise<AnimeSpot[]> {
        return this.enrichWithLikes(SEED_DATA);
    }

    async getById(id: string, _userId?: string): Promise<AnimeSpot | null> {
        const spot = SEED_DATA.find(s => s.id === id);
        if (!spot) return null;
        
        const likedIds = this.getLikedIds();
        return {
            ...spot,
            isLiked: likedIds.includes(spot.id)
        };
    }

    async getByCategory(category: AnimeCategory, _userId?: string): Promise<AnimeSpot[]> {
        const filtered = SEED_DATA.filter(s => s.category === category);
        return this.enrichWithLikes(filtered);
    }

    async search(query: string, _userId?: string): Promise<AnimeSpot[]> {
        const lowercaseQuery = query.toLowerCase();
        const filtered = SEED_DATA.filter(s => 
            s.title.toLowerCase().includes(lowercaseQuery) ||
            s.sceneName.toLowerCase().includes(lowercaseQuery) ||
            s.location.toLowerCase().includes(lowercaseQuery) ||
            s.description?.toLowerCase().includes(lowercaseQuery)
        );
        return this.enrichWithLikes(filtered);
    }

    async toggleLike(id: string, _userId: string): Promise<AnimeSpot | null> {
        const spot = SEED_DATA.find(s => s.id === id);
        if (!spot) return null;

        const likedIds = this.getLikedIds();
        const isCurrentlyLiked = likedIds.includes(id);
        
        if (isCurrentlyLiked) {
            this.saveLikedIds(likedIds.filter(likedId => likedId !== id));
        } else {
            this.saveLikedIds([...likedIds, id]);
        }

        return {
            ...spot,
            isLiked: !isCurrentlyLiked
        };
    }

    async getLikedByUser(_userId: string): Promise<AnimeSpot[]> {
        const likedIds = this.getLikedIds();
        const likedSpots = SEED_DATA.filter(s => likedIds.includes(s.id));
        return likedSpots.map(spot => ({ ...spot, isLiked: true }));
    }
}
