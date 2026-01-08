export type ThemeCategoryId = 'animation' | 'food' | 'sightseeing' | 'history';

export interface ThemeCategory {
    id: ThemeCategoryId;
    name: string;
    description: string;
    icon: string;
    color: string;
    gradient: string;
}

export type AnimationSubCategory = 'romance' | 'fantasy' | 'sports' | 'action' | 'nature' | 'ghibli' | 'shinkai';
export type FoodSubCategory = 'ramen' | 'sushi' | 'izakaya' | 'cafe' | 'street' | 'michelin';
export type SightseeingSubCategory = 'temple' | 'nature' | 'city' | 'beach' | 'mountain' | 'museum';
export type HistorySubCategory = 'castle' | 'shrine' | 'war' | 'ancient' | 'modern' | 'world-heritage';

export type ThemeSubCategory = AnimationSubCategory | FoodSubCategory | SightseeingSubCategory | HistorySubCategory;

export interface ThemeSpot {
    id: string;
    themeId: ThemeCategoryId;
    title: string;
    subtitle: string;
    imageUrl: string;
    lat: number;
    lng: number;
    tip: string;
    subCategory: ThemeSubCategory;
    rating: number;
    location: string;
    description?: string;
    isLiked?: boolean;
}

export interface ThemeSpotFilter {
    themeId?: ThemeCategoryId;
    subCategory?: ThemeSubCategory;
    searchQuery?: string;
}

export const THEME_CATEGORIES: ThemeCategory[] = [
    {
        id: 'animation',
        name: '애니메이션',
        description: '명작 애니메이션의 배경이 된 실제 장소들',
        icon: 'movie',
        color: 'bg-teal-500',
        gradient: 'from-teal-400 to-cyan-500'
    },
    {
        id: 'food',
        name: '맛집',
        description: '현지인이 추천하는 숨은 맛집 투어',
        icon: 'restaurant',
        color: 'bg-emerald-500',
        gradient: 'from-emerald-400 to-teal-500'
    },
    {
        id: 'sightseeing',
        name: '관광지',
        description: '꼭 가봐야 할 인기 관광 명소',
        icon: 'photo_camera',
        color: 'bg-sky-500',
        gradient: 'from-sky-400 to-cyan-500'
    },
    {
        id: 'history',
        name: '역사기행',
        description: '역사 속 그 장소를 찾아서',
        icon: 'castle',
        color: 'bg-slate-600',
        gradient: 'from-slate-500 to-teal-600'
    }
];

export const SUB_CATEGORY_FILTERS: Record<ThemeCategoryId, { label: string; value: ThemeSubCategory | 'all' }[]> = {
    animation: [
        { label: "전체", value: "all" },
        { label: "지브리 스튜디오", value: "ghibli" },
        { label: "신카이 마코토", value: "shinkai" },
        { label: "스포츠/청춘", value: "sports" },
        { label: "로맨스", value: "romance" },
        { label: "액션", value: "action" },
        { label: "자연/판타지", value: "nature" },
    ],
    food: [
        { label: "전체", value: "all" },
        { label: "라멘", value: "ramen" },
        { label: "스시", value: "sushi" },
        { label: "이자카야", value: "izakaya" },
        { label: "카페", value: "cafe" },
        { label: "스트릿푸드", value: "street" },
        { label: "미슐랭", value: "michelin" },
    ],
    sightseeing: [
        { label: "전체", value: "all" },
        { label: "사찰/신사", value: "temple" },
        { label: "자연", value: "nature" },
        { label: "도시", value: "city" },
        { label: "해변", value: "beach" },
        { label: "산", value: "mountain" },
        { label: "박물관", value: "museum" },
    ],
    history: [
        { label: "전체", value: "all" },
        { label: "성", value: "castle" },
        { label: "신사", value: "shrine" },
        { label: "전쟁유적", value: "war" },
        { label: "고대", value: "ancient" },
        { label: "근대", value: "modern" },
        { label: "세계유산", value: "world-heritage" },
    ],
};

export const SUB_CATEGORY_LABELS: Record<ThemeSubCategory, string> = {
    romance: "로맨스",
    fantasy: "판타지",
    sports: "스포츠",
    action: "액션",
    nature: "자연",
    ghibli: "지브리",
    shinkai: "신카이",
    ramen: "라멘",
    sushi: "스시",
    izakaya: "이자카야",
    cafe: "카페",
    street: "스트릿푸드",
    michelin: "미슐랭",
    temple: "사찰/신사",
    city: "도시",
    beach: "해변",
    mountain: "산",
    museum: "박물관",
    castle: "성",
    shrine: "신사",
    war: "전쟁유적",
    ancient: "고대",
    modern: "근대",
    "world-heritage": "세계유산",
};

export const SUB_CATEGORY_COLORS: Record<ThemeSubCategory, string> = {
    romance: "bg-pink-500/90",
    fantasy: "bg-purple-500/90",
    sports: "bg-orange-500/90",
    action: "bg-red-500/90",
    nature: "bg-green-500/90",
    ghibli: "bg-emerald-500/90",
    shinkai: "bg-blue-500/90",
    ramen: "bg-yellow-600/90",
    sushi: "bg-red-400/90",
    izakaya: "bg-amber-500/90",
    cafe: "bg-amber-700/90",
    street: "bg-orange-400/90",
    michelin: "bg-yellow-500/90",
    temple: "bg-red-600/90",
    city: "bg-slate-500/90",
    beach: "bg-cyan-500/90",
    mountain: "bg-green-600/90",
    museum: "bg-indigo-500/90",
    castle: "bg-stone-600/90",
    shrine: "bg-red-700/90",
    war: "bg-gray-600/90",
    ancient: "bg-amber-700/90",
    modern: "bg-slate-600/90",
    "world-heritage": "bg-teal-600/90",
};
