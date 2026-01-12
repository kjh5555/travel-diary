import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ANIME_SPOTS = [
    {
        id: "anime-1",
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
        id: "anime-2",
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
        id: "anime-3",
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
        id: "anime-4",
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
        id: "anime-5",
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
        id: "anime-6",
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
        id: "anime-7",
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
        id: "anime-8",
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

const THEME_SPOTS = [
    // Animation
    {
        id: "animation-1",
        themeId: "animation",
        title: "너의 이름은",
        subtitle: "스가 신사 계단",
        imageUrl: "/images/anime/your-name-stairs.jpg",
        lat: 35.6762,
        lng: 139.7650,
        tip: "해질녘에 방문하면 영화 속 장면을 재현할 수 있습니다. 계단 중간에서 촬영하세요.",
        subCategory: "romance",
        rating: 4.9,
        location: "도쿄, 일본",
        description: "미츠하와 타키가 마지막에 재회하는 감동적인 장면의 배경이 된 장소입니다."
    },
    {
        id: "animation-2",
        themeId: "animation",
        title: "센과 치히로의 행방불명",
        subtitle: "유바바의 온천",
        imageUrl: "/images/anime/spirited-away-bathhouse.jpg",
        lat: 36.5613,
        lng: 136.8866,
        tip: "밤에 조명이 켜지면 더욱 환상적입니다. 주변 온천마을도 함께 둘러보세요.",
        subCategory: "ghibli",
        rating: 4.8,
        location: "가나자와, 일본",
        description: "지브리 스튜디오의 명작 속 온천장의 모티브가 된 곳입니다."
    },
    {
        id: "animation-3",
        themeId: "animation",
        title: "슬램덩크",
        subtitle: "가마쿠라 건널목",
        imageUrl: "/images/anime/slam-dunk-crossing.jpg",
        lat: 35.3066,
        lng: 139.4940,
        tip: "에노덴 열차가 지나가는 순간을 포착하세요. 오전 시간대가 인파가 적습니다.",
        subCategory: "sports",
        rating: 4.7,
        location: "가마쿠라, 일본",
        description: "오프닝에 등장하는 유명한 건널목 장면입니다."
    },
    {
        id: "animation-4",
        themeId: "animation",
        title: "날씨의 아이",
        subtitle: "시부야 하늘 정원",
        imageUrl: "/images/anime/weathering-with-you-garden.jpg",
        lat: 35.6580,
        lng: 139.7016,
        tip: "비 오는 날 방문하면 영화의 분위기를 더 잘 느낄 수 있습니다.",
        subCategory: "shinkai",
        rating: 4.6,
        location: "도쿄, 일본",
        description: "히나가 맑은 날씨를 기원하는 장면의 배경입니다."
    },
    {
        id: "animation-5",
        themeId: "animation",
        title: "하울의 움직이는 성",
        subtitle: "콜마르 마을",
        imageUrl: "/images/anime/howls-castle-town.jpg",
        lat: 48.0794,
        lng: 7.3582,
        tip: "구시가지의 프티 베니스 지역이 가장 영화와 비슷합니다.",
        subCategory: "ghibli",
        rating: 4.8,
        location: "콜마르, 프랑스",
        description: "소피가 살던 마을의 모티브가 된 동화 같은 도시입니다."
    },
    {
        id: "animation-6",
        themeId: "animation",
        title: "주술회전",
        subtitle: "시부야역 스크램블 교차로",
        imageUrl: "/images/anime/jjk-shibuya.jpg",
        lat: 35.6595,
        lng: 139.7004,
        tip: "시부야 사변 아크의 배경입니다. 야경 촬영을 추천합니다.",
        subCategory: "action",
        rating: 4.5,
        location: "도쿄, 일본",
        description: "시부야 사변의 격전지였던 곳입니다."
    },
    {
        id: "animation-7",
        themeId: "animation",
        title: "모노노케 히메",
        subtitle: "야쿠시마 숲",
        imageUrl: "/images/anime/mononoke-forest.jpg",
        lat: 30.3475,
        lng: 130.5578,
        tip: "조몬 삼나무까지 등산은 체력이 필요합니다. 여유로운 일정을 잡으세요.",
        subCategory: "ghibli",
        rating: 4.9,
        location: "야쿠시마, 일본",
        description: "시시가미의 숲의 모티브가 된 신비로운 원시림입니다."
    },
    {
        id: "animation-8",
        themeId: "animation",
        title: "스즈메의 문단속",
        subtitle: "규슈 폐허 학교",
        imageUrl: "/images/anime/suzume-school.jpg",
        lat: 32.8031,
        lng: 130.7079,
        tip: "실제 촬영지는 사유지입니다. 원경으로만 촬영하세요.",
        subCategory: "shinkai",
        rating: 4.4,
        location: "구마모토, 일본",
        description: "스즈메가 처음 문을 발견한 폐허의 모티브입니다."
    },

    // Food
    {
        id: "food-1",
        themeId: "food",
        title: "이치란 라멘 본점",
        subtitle: "돈코츠 라멘",
        imageUrl: "/images/food/ichiran-ramen.jpg",
        lat: 33.5903,
        lng: 130.4017,
        tip: "개인 부스에서 집중해서 라멘을 즐길 수 있습니다. 면 굵기와 국물 농도 조절 가능.",
        subCategory: "ramen",
        rating: 4.7,
        location: "후쿠오카, 일본",
        description: "일본 돈코츠 라멘의 대표 맛집. 1인 부스 시스템이 특징입니다."
    },
    {
        id: "food-2",
        themeId: "food",
        title: "츠키지 스시다이",
        subtitle: "오마카세 스시",
        imageUrl: "/images/food/tsukiji-sushi.jpg",
        lat: 35.6654,
        lng: 139.7707,
        tip: "새벽 5시부터 줄을 서야 합니다. 오마카세 코스가 가성비 좋습니다.",
        subCategory: "sushi",
        rating: 4.9,
        location: "도쿄, 일본",
        description: "츠키지 시장의 전설적인 스시집. 신선한 참치가 일품입니다."
    },
    {
        id: "food-3",
        themeId: "food",
        title: "토리키조쿠",
        subtitle: "야키토리 & 하이볼",
        imageUrl: "/images/food/torikizoku.jpg",
        lat: 35.6938,
        lng: 139.7034,
        tip: "전 메뉴 298엔의 가성비 이자카야. 하이볼과 야키토리 조합 추천.",
        subCategory: "izakaya",
        rating: 4.3,
        location: "도쿄, 일본",
        description: "일본 직장인들이 사랑하는 서민 이자카야 체인입니다."
    },
    {
        id: "food-4",
        themeId: "food",
        title: "% 아라비카 교토",
        subtitle: "라떼 아트",
        imageUrl: "/images/food/arabica-kyoto.jpg",
        lat: 35.0036,
        lng: 135.7727,
        tip: "아라시야마점은 뷰가 좋고, 히가시야마점은 한적합니다.",
        subCategory: "cafe",
        rating: 4.6,
        location: "교토, 일본",
        description: "세계적인 바리스타 챔피언이 운영하는 스페셜티 커피숍입니다."
    },
    {
        id: "food-5",
        themeId: "food",
        title: "오사카 도톤보리 타코야키",
        subtitle: "타코야키",
        imageUrl: "/images/food/takoyaki-osaka.jpg",
        lat: 34.6687,
        lng: 135.5012,
        tip: "갓 구운 타코야키는 매우 뜨거우니 조심하세요. 소스와 마요네즈 조합 강추.",
        subCategory: "street",
        rating: 4.5,
        location: "오사카, 일본",
        description: "오사카의 소울푸드. 겉바속촉의 끝판왕입니다."
    },
    {
        id: "food-6",
        themeId: "food",
        title: "스키야바시 지로",
        subtitle: "에도마에 스시",
        imageUrl: "/images/food/sukiyabashi-jiro.jpg",
        lat: 35.6735,
        lng: 139.7634,
        tip: "최소 한 달 전 예약 필수. 오바마 전 대통령도 방문한 곳.",
        subCategory: "michelin",
        rating: 5.0,
        location: "도쿄, 일본",
        description: "미슐랭 3스타. '스시 장인의 꿈' 다큐멘터리로 유명한 전설적인 스시야."
    },

    // Sightseeing
    {
        id: "sightseeing-1",
        themeId: "sightseeing",
        title: "후시미 이나리 신사",
        subtitle: "천 개의 토리이",
        imageUrl: "/images/sightseeing/fushimi-inari.jpg",
        lat: 34.9671,
        lng: 135.7727,
        tip: "새벽이나 저녁에 방문하면 인파를 피할 수 있습니다. 정상까지 왕복 2시간.",
        subCategory: "temple",
        rating: 4.8,
        location: "교토, 일본",
        description: "주홍빛 토리이가 끝없이 이어지는 신비로운 신사입니다."
    },
    {
        id: "sightseeing-2",
        themeId: "sightseeing",
        title: "도쿄 스카이트리",
        subtitle: "세계 최고 타워",
        imageUrl: "/images/sightseeing/skytree.jpg",
        lat: 35.7101,
        lng: 139.8107,
        tip: "일몰 시간에 맞춰 방문하면 야경까지 볼 수 있습니다. 온라인 예매 추천.",
        subCategory: "city",
        rating: 4.6,
        location: "도쿄, 일본",
        description: "634m 높이의 전파탑. 도쿄 전경을 한눈에 볼 수 있습니다."
    },
    {
        id: "sightseeing-3",
        themeId: "sightseeing",
        title: "오키나와 케라마 제도",
        subtitle: "케라마 블루",
        imageUrl: "/images/sightseeing/kerama.jpg",
        lat: 26.1983,
        lng: 127.3025,
        tip: "스노클링 장비를 챙기세요. 바다거북을 높은 확률로 만날 수 있습니다.",
        subCategory: "beach",
        rating: 4.9,
        location: "오키나와, 일본",
        description: "투명한 에메랄드빛 바다로 유명한 국립공원입니다."
    },
    {
        id: "sightseeing-4",
        themeId: "sightseeing",
        title: "후지산 5고메",
        subtitle: "일본 최고봉",
        imageUrl: "/images/sightseeing/fuji.jpg",
        lat: 35.3606,
        lng: 138.7274,
        tip: "7-8월 등반 시즌에는 산장 예약 필수. 고산병 주의하세요.",
        subCategory: "mountain",
        rating: 4.9,
        location: "야마나시, 일본",
        description: "일본의 상징. 유네스코 세계문화유산입니다."
    },
    {
        id: "sightseeing-5",
        themeId: "sightseeing",
        title: "팀랩 보더리스",
        subtitle: "디지털 아트",
        imageUrl: "/images/sightseeing/teamlab.jpg",
        lat: 35.6268,
        lng: 139.7837,
        tip: "흰색 또는 밝은 옷을 입으면 작품에 투영되어 더 예쁜 사진을 찍을 수 있습니다.",
        subCategory: "museum",
        rating: 4.7,
        location: "도쿄, 일본",
        description: "경계 없는 디지털 아트 뮤지엄. 몰입형 예술 체험의 정점."
    },
    {
        id: "sightseeing-6",
        themeId: "sightseeing",
        title: "아라시야마 대나무숲",
        subtitle: "치쿠린",
        imageUrl: "/images/sightseeing/arashiyama.jpg",
        lat: 35.0094,
        lng: 135.6722,
        tip: "이른 아침(7시 전)에 방문해야 사람 없는 사진을 찍을 수 있습니다.",
        subCategory: "nature",
        rating: 4.7,
        location: "교토, 일본",
        description: "하늘을 찌를 듯한 대나무가 만드는 초록빛 터널입니다."
    },

    // History
    {
        id: "history-1",
        themeId: "history",
        title: "히메지성",
        subtitle: "백로성",
        imageUrl: "/images/history/himeji.jpg",
        lat: 34.8394,
        lng: 134.6939,
        tip: "벚꽃 시즌에는 야간 개장도 합니다. 천수각까지 오르는 계단이 가파릅니다.",
        subCategory: "castle",
        rating: 4.9,
        location: "효고, 일본",
        description: "일본에서 가장 아름다운 성. 세계문화유산이자 국보입니다."
    },
    {
        id: "history-2",
        themeId: "history",
        title: "이세신궁",
        subtitle: "일본 신도의 성지",
        imageUrl: "/images/history/ise-jingu.jpg",
        lat: 34.4550,
        lng: 136.7256,
        tip: "내궁과 외궁 모두 방문하세요. 오카게 요코초에서 아카후쿠 떡 드세요.",
        subCategory: "shrine",
        rating: 4.9,
        location: "미에, 일본",
        description: "2000년 역사의 일본 최고 신사. 20년마다 다시 짓는 전통이 있습니다."
    },
    {
        id: "history-3",
        themeId: "history",
        title: "히로시마 평화기념공원",
        subtitle: "원폭 돔",
        imageUrl: "/images/history/hiroshima.jpg",
        lat: 34.3955,
        lng: 132.4536,
        tip: "평화기념자료관도 함께 방문하세요. 무거운 마음의 준비가 필요합니다.",
        subCategory: "war",
        rating: 4.8,
        location: "히로시마, 일본",
        description: "원폭 피해를 기억하고 평화를 기원하는 세계유산입니다."
    },
    {
        id: "history-4",
        themeId: "history",
        title: "나라 토다이지",
        subtitle: "대불전",
        imageUrl: "/images/history/todaiji.jpg",
        lat: 34.6890,
        lng: 135.8399,
        tip: "사슴 센베이를 사서 사슴에게 주세요. 대불전 뒤쪽 기둥 구멍 통과 도전!",
        subCategory: "ancient",
        rating: 4.8,
        location: "나라, 일본",
        description: "세계 최대의 목조 건물. 752년에 건립된 고대 불교 사원입니다."
    },
    {
        id: "history-5",
        themeId: "history",
        title: "메이지 신궁",
        subtitle: "도심 속 숲",
        imageUrl: "/images/history/meiji-jingu.jpg",
        lat: 35.6764,
        lng: 139.6993,
        tip: "정월 초에는 300만 명이 방문합니다. 평일 아침이 한적합니다.",
        subCategory: "modern",
        rating: 4.6,
        location: "도쿄, 일본",
        description: "메이지 천황을 기리는 신사. 1920년 창건된 근대 일본의 상징입니다."
    },
    {
        id: "history-6",
        themeId: "history",
        title: "시라카와고",
        subtitle: "갓쇼즈쿠리",
        imageUrl: "/images/history/shirakawago.jpg",
        lat: 36.2576,
        lng: 136.9065,
        tip: "겨울 라이트업 기간에 방문하면 동화 같은 풍경을 볼 수 있습니다.",
        subCategory: "world-heritage",
        rating: 4.9,
        location: "기후, 일본",
        description: "합장 양식 가옥이 보존된 전통 마을. 유네스코 세계유산입니다."
    },
];

async function main() {
    console.log("🌱 Starting seed...");

    console.log("📍 Seeding anime spots...");
    for (const spot of ANIME_SPOTS) {
        await prisma.animeSpot.upsert({
            where: { id: spot.id },
            update: spot,
            create: spot,
        });
    }
    console.log(`✅ ${ANIME_SPOTS.length} anime spots seeded`);

    console.log("📍 Seeding theme spots...");
    for (const spot of THEME_SPOTS) {
        await prisma.themeSpot.upsert({
            where: { id: spot.id },
            update: spot,
            create: spot,
        });
    }
    console.log(`✅ ${THEME_SPOTS.length} theme spots seeded`);

    console.log("🎉 Seed completed!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
