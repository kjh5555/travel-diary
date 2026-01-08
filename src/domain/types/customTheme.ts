import { Place } from "./place";

export interface CustomTheme {
    id: string;
    name: string;
    description?: string;
    coverImage?: string;
    color: string;
    icon: string;
    places: CustomThemePlace[];
    createdAt: string;
    updatedAt: string;
}

export interface CustomThemePlace {
    id: string;
    place: Place;
    note?: string;
    addedAt: string;
}

export interface CreateCustomThemeInput {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    coverImage?: string;
}

export interface UpdateCustomThemeInput {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    coverImage?: string;
}

export interface AddPlaceToThemeInput {
    themeId: string;
    place: Place;
    note?: string;
}

export const CUSTOM_THEME_COLORS = [
    { id: "rose", value: "bg-rose-500", gradient: "from-rose-400 to-pink-500" },
    { id: "orange", value: "bg-orange-500", gradient: "from-orange-400 to-amber-500" },
    { id: "amber", value: "bg-amber-500", gradient: "from-amber-400 to-yellow-500" },
    { id: "emerald", value: "bg-emerald-500", gradient: "from-emerald-400 to-teal-500" },
    { id: "teal", value: "bg-teal-500", gradient: "from-teal-400 to-cyan-500" },
    { id: "sky", value: "bg-sky-500", gradient: "from-sky-400 to-blue-500" },
    { id: "indigo", value: "bg-indigo-500", gradient: "from-indigo-400 to-violet-500" },
    { id: "purple", value: "bg-purple-500", gradient: "from-purple-400 to-fuchsia-500" },
    { id: "slate", value: "bg-slate-500", gradient: "from-slate-400 to-gray-500" },
];

export const CUSTOM_THEME_ICONS = [
    "restaurant",
    "local_cafe",
    "shopping_bag",
    "photo_camera",
    "museum",
    "park",
    "beach_access",
    "nightlife",
    "temple_buddhist",
    "castle",
    "sports_soccer",
    "spa",
    "local_bar",
    "theater_comedy",
    "attractions",
    "hiking",
];

export const DEFAULT_THEME_COLOR = CUSTOM_THEME_COLORS[4];

export const DEFAULT_THEME_ICON = "collections_bookmark";
