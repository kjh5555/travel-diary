# Database Design: Travel Scrapbook

## Entity Relationship Diagram (ERD)

Supabase(PostgreSQL) 기반의 관계형 데이터베이스 스키마 설계입니다.

```mermaid
erDiagram
    %% 사용자 테이블
    users ||--o{ travels : "creates"
    users {
        uuid id PK "Supabase Auth UID"
        string email "이메일"
        string nickname "닉네임"
        string avatar_url "프로필 이미지"
        timestamp created_at
    }

    %% 여행(다이어리) 메타 정보
    travels ||--o{ timeline_items : "contains"
    travels {
        uuid id PK
        uuid user_id FK
        string title "여행 제목"
        date start_date "시작일"
        date end_date "종료일"
        string cover_image_url "표지 이미지"
        string theme_style "다이어리 테마 (css class)"
        boolean is_public "공개 여부"
        timestamp created_at
        timestamp updated_at
    }

    %% 타임라인 아이템 (개별 기록)
    timeline_items ||--o{ photos : "has"
    timeline_items {
        uuid id PK
        uuid travel_id FK
        timestamp item_time "기록 시간"
        float lat "위도"
        float lng "경도"
        string location_name "장소명 (Google Maps)"
        text memo "감성 메모"
        string sticker_config "스티커 JSON 설정"
        int order_index "정렬 순서"
    }

    %% 사진 정보
    photos {
        uuid id PK
        uuid timeline_item_id FK
        string url "이미지 URL (Storage)"
        int width
        int height
        boolean is_anime_shot "애니메이션 성지순례 사진 여부"
    }

    %% 애니메이션 성지 데이터 (정적 데이터)
    anime_spots {
        uuid id PK
        string title "작품명"
        string scene_name "장면 이름"
        string original_image_url "애니 원본 장면"
        float lat
        float lng
        text guide_tip "촬영 팁"
    }
```

## 주요 테이블 설명

### 1. `users`
*   사용자 기본 정보. Supabase Auth의 `auth.users`와 연동하되, 앱 전용 프로필 정보(닉네임, 아바타)를 별도 관리.

### 2. `travels` (Travel Diary)
*   하나의 여행 프로젝트 단위. 책 한 권(Scrapbook)에 해당합니다.
*   `theme_style`: 다이어리의 전체적인 룩앤필(ex: `paper-v1`, `kraft-v2`)을 결정하는 식별자.

### 3. `timeline_items`
*   여행기 내의 개별 페이지 혹은 섹션.
*   `sticker_config`: 사용자가 배치한 스티커의 종류, 위치(x, y), 회전각도 등을 JSON 형태로 저장하여 로딩 시 렌더링.

### 4. `anime_spots`
*   관리자(개발자)가 미리 입력해두는 데이터. 사용자가 선택하여 '따라잡기' 기능을 수행할 기준 정보.
