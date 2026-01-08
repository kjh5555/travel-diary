# Task.md - Travel Scrapbook 개발 태스크 목록

## 개요

이 문서는 AI가 개발을 수행할 수 있는 개별 태스크들을 정리한 문서입니다.
각 태스크는 기획 문서, 디자인 파일, 기존 구현 코드를 레퍼런스합니다.

---

## 태스크 구성 원칙

- 각 태스크는 독립적으로 수행 가능해야 함
- Clean Architecture 원칙 준수 (Domain → Data → Presentation → App)
- 기존 구현된 코드 패턴 활용
- 디자인 파일의 UI/UX 충실히 반영

---

## Phase 1: 기반 UI 구현

### Task 1.1: 홈 대시보드 UI 리뉴얼

**설명**: 현재 홈 페이지를 디자인 시안에 맞게 전면 리뉴얼합니다.

**레퍼런스**:
- 디자인: [design/Home/code.html](design/Home/code.html)
- UI 가이드: [docs/ui_style_guide.md](docs/ui_style_guide.md) - Color Palette, Typography
- 디자인 시스템: [docs/DesignSystem.md](docs/DesignSystem.md) - Polaroid 카드, 마스킹 테이프 효과
- 기존 구현: [src/app/page.tsx](src/app/page.tsx)

**구현 내용**:
1. 사이드바 네비게이션 리뉴얼 (홈, 여정, 테마 여행, 저장된 장소 지도)
2. 사용자 프로필 영역 구현
3. 환영 메시지 및 통계 카드 (방문한 국가, 총 여행 일수, 촬영한 사진, 방문한 도시)
4. "다가오는 여행" 카드 컴포넌트 (날짜, 날씨, 상세보기 버튼)
5. "최근 추억" 섹션 구현
6. "테마 여행" 추천 섹션 구현
7. "저장된 장소" 지도 미리보기 섹션

**스타일 요구사항**:
- Primary 색상: `#13b6ec`
- 배경색: `#f8fbfc` (라이트), `#101d22` (다크)
- Font: Plus Jakarta Sans + Noto Sans KR
- Material Symbols 아이콘 사용

---

### Task 1.2: 사이드바 컴포넌트 개선

**설명**: 디자인 시안에 맞게 사이드바를 개선합니다.

**레퍼런스**:
- 디자인: [design/Home/code.html](design/Home/code.html) - aside 태그 참조
- 기존 구현: [src/presentation/components/Sidebar.tsx](src/presentation/components/Sidebar.tsx)

**구현 내용**:
1. 사용자 프로필 아바타 및 이름 표시
2. 네비게이션 메뉴 (홈, 여정, 테마 여행, 저장된 장소 지도)
3. Active 상태 스타일링 (primary 색상 배경, 아이콘 filled)
4. "여행 팁" 카드 컴포넌트
5. 로그아웃 버튼
6. 모바일 반응형 (lg:hidden 처리)

---

### Task 1.3: 헤더 컴포넌트 개선

**설명**: 모바일용 헤더와 데스크탑용 헤더를 분리하여 구현합니다.

**레퍼런스**:
- 디자인: [design/Home/code.html](design/Home/code.html) - header 태그 참조
- 기존 구현: [src/presentation/components/Header.tsx](src/presentation/components/Header.tsx)

**구현 내용**:
1. 모바일 헤더 (lg:hidden): 프로필 아바타, 메뉴 버튼
2. 데스크탑에서는 사이드바가 헤더 역할 수행
3. 검색 기능 통합 (선택적)

---

## Phase 2: 여정(Itinerary) 페이지 구현

### Task 2.1: 여정 목록 페이지 구현

**설명**: 사용자의 모든 여행 목록을 표시하는 페이지를 구현합니다.

**레퍼런스**:
- 디자인: [design/itinerary/code.html](design/itinerary/code.html)
- PRD: [docs/PRD.md](docs/PRD.md) - Section 5 핵심 기능
- 기존 구현: [src/presentation/components/Planner/PlannerCard.tsx](src/presentation/components/Planner/PlannerCard.tsx)
- Use Case: [src/domain/usecases/itinerary/GetTripItinerariesUseCase.ts](src/domain/usecases/itinerary/GetTripItinerariesUseCase.ts)

**구현 내용**:
1. 페이지 타이틀 및 "새 여행" 버튼
2. 탭 네비게이션 (예정됨, 진행 중, 완료됨)
3. 검색 바
4. 여정 카드 리스트
   - 상태 인디케이터 (초록: 진행 중, 파랑: 예정됨, 회색: 완료됨)
   - 여행 이미지
   - 제목, 위치, 날짜
   - D-Day 또는 "1년 전" 같은 상대 시간 표시
   - "상세 보기" / "일정 관리" / "기록 보기" 버튼
5. 완료된 여행은 grayscale 효과 적용
6. 빈 상태 플레이스홀더 ("새로운 여정을 시작해보세요")

**라우팅**: `/journeys` 또는 `/itineraries`

---

### Task 2.2: 여정 상세 페이지 구현

**설명**: 특정 여행의 일자별 일정을 타임라인 형태로 보여주는 페이지입니다.

**레퍼런스**:
- 디자인: [design/successJourney/code.html](design/successJourney/code.html)
- User Flow: [docs/UserFlow.md](docs/UserFlow.md) - 여행 기록 생성 섹션
- 기존 구현: [src/presentation/components/Planner/PlannerDetail.tsx](src/presentation/components/Planner/PlannerDetail.tsx)
- Use Case: [src/domain/usecases/itinerary/GetTripItineraryUseCase.ts](src/domain/usecases/itinerary/GetTripItineraryUseCase.ts)

**구현 내용**:
1. 히어로 이미지 (여행 대표 이미지)
2. 여행 메타 정보 (태그, 제목, 날짜, 사진 수)
3. "일정 편집" 버튼
4. 일자별 탭 네비게이션 (1일차, 2일차, ...)
5. 타임라인 뷰
   - 시간 표시 (10:30 오전)
   - 타임라인 도트 (primary 색상)
   - 장소 카드 (제목, 위치, 메모, 사진 그리드)
   - 좋아요 버튼 (빨간색 하트)
6. 사이드 패널 (데스크탑)
   - 일자별 경로 지도
   - 총 이동 거리
   - 오늘의 메모

**라우팅**: `/journeys/[id]`

---

### Task 2.3: 여정 편집 페이지 구현

**설명**: 여행 일정을 편집할 수 있는 페이지입니다.

**레퍼런스**:
- 디자인: [design/editplan/code.html](design/editplan/code.html)
- 기존 구현: [src/presentation/components/NewJourney/](src/presentation/components/NewJourney/)
- Use Case: [src/domain/usecases/itinerary/SaveTripItineraryUseCase.ts](src/domain/usecases/itinerary/SaveTripItineraryUseCase.ts)

**구현 내용**:
1. 브레드크럼 네비게이션 (내 여행 / 여정 편집)
2. 여행 기본 정보 편집 폼
   - 여행 제목 입력
   - 일정 날짜 선택 (시작일-종료일)
   - 동행자 추가 버튼
3. 일자별 일정 편집
   - 일자 헤더 (1일차, 날짜, 테마)
   - 타임라인 형식 일정 카드
   - 이동 정보 표시 (차량 이동 35분, 18km)
   - 각 장소 hover 시 편집/삭제 버튼 노출
   - "활동 추가" 버튼
4. 지도 패널 (우측 sticky)
   - 일자별 경로 표시
   - 마커 및 경로선
   - 경로 요약 (거리, 운전 시간)
5. 저장/취소 버튼

**라우팅**: `/journeys/[id]/edit`

---

## Phase 3: 저장된 장소 (Pick My Place) 페이지

### Task 3.1: 저장된 장소 목록 페이지 구현

**설명**: 사용자가 좋아요 표시한 장소들을 목록과 지도로 보여주는 페이지입니다.

**레퍼런스**:
- 디자인: [design/pickmyPlace/code.html](design/pickmyPlace/code.html)
- 기존 구현: [src/app/memories/page.tsx](src/app/memories/page.tsx)
- 타입: [src/domain/types/itinerary.ts](src/domain/types/itinerary.ts) - PlaceMemory

**구현 내용**:
1. 페이지 헤더 (제목, 설명)
2. 필터 칩 (전체, 음식점, 숙소, 명소)
3. 장소 카드 리스트
   - 이미지
   - 카테고리 태그 (명소/음식점/숙소)
   - 별점
   - 장소명
   - 주소
   - 좋아요 버튼 (filled heart)
   - "일정에 추가" 버튼
4. 사이드 지도 패널 (데스크탑, 45% 너비)
   - 저장된 장소 마커 표시
   - 호버 시 장소명 툴팁
   - 줌 컨트롤
   - 현재 위치 버튼

**라우팅**: `/places` 또는 `/saved-places`

---

### Task 3.2: 장소 상세 모달/페이지 구현

**설명**: 저장된 장소의 상세 정보와 추억을 보여주는 컴포넌트입니다.

**레퍼런스**:
- 기존 구현: [src/presentation/components/Place/PlaceDetailsCard.tsx](src/presentation/components/Place/PlaceDetailsCard.tsx)
- Use Case: [src/domain/usecases/place/GetPlaceDetailsUseCase.ts](src/domain/usecases/place/GetPlaceDetailsUseCase.ts)

**구현 내용**:
1. 장소 기본 정보 (이름, 주소, 평점, 영업 시간)
2. 사진 갤러리
3. 사용자 메모 표시
4. "일정에 추가" 버튼
5. "좋아요 취소" 버튼

---

## Phase 4: 테마 여행 (Theme Tour) 페이지

### Task 4.1: 테마 여행 메인 페이지 구현

**설명**: 애니메이션 성지순례 등 테마별 여행지를 탐색하는 페이지입니다.

**레퍼런스**:
- 디자인: [design/themaTour/code.html](design/themaTour/code.html)
- PRD: [docs/PRD.md](docs/PRD.md) - FEAT-3 애니 명장면 따라잡기
- DB 설계: [docs/DatabaseDesign.md](docs/DatabaseDesign.md) - anime_spots 테이블

**구현 내용**:
1. 페이지 헤더 ("애니메이션 속 그 장소로 떠나는 여행")
2. 검색 바
3. 필터 칩 (전체, 지브리 스튜디오, 신카이 마코토, 스포츠/청춘, 판타지)
4. 테마 카드 그리드 (3:4 비율)
   - 배경 이미지 (호버 시 확대)
   - 위치 배지 (예: "도쿄, 일본")
   - 좋아요 버튼
   - 작품 카테고리 태그 (로맨스, 판타지, 스포츠 등)
   - 별점
   - 작품명 (너의 이름은, 센과 치히로의 행방불명 등)
   - 장소 설명
5. "나만의 테마 찾기" 플레이스홀더 카드

**라우팅**: `/themes` 또는 `/theme-tours`

---

### Task 4.2: 애니 명소 데이터 구조 및 Repository 구현

**설명**: 테마 여행에 사용될 애니메이션 명소 데이터를 관리합니다.

**레퍼런스**:
- DB 설계: [docs/DatabaseDesign.md](docs/DatabaseDesign.md) - anime_spots 테이블
- PRD: [docs/PRD.md](docs/PRD.md) - 애니 명장면 따라잡기

**구현 내용**:
1. Domain 타입 정의 (`src/domain/types/animeSpot.ts`)
   ```typescript
   interface AnimeSpot {
     id: string;
     title: string;           // 작품명
     sceneName: string;       // 장면 이름
     originalImageUrl: string; // 애니 원본 장면
     lat: number;
     lng: number;
     guideTip: string;        // 촬영 팁
     category: 'romance' | 'fantasy' | 'sports' | 'action' | 'nature';
     rating: number;
     location: string;        // "도쿄, 일본"
   }
   ```
2. Repository 인터페이스 (`src/domain/repositories/IAnimeSpotRepository.ts`)
3. Mock/LocalStorage Repository 구현
4. Use Cases:
   - GetAnimeSpotListUseCase
   - GetAnimeSpotByIdUseCase
   - FilterAnimeSpotsByCategoryUseCase

---

### Task 4.3: 애니 명소 상세 페이지 구현

**설명**: 특정 애니메이션 명소의 상세 정보와 원본 장면을 보여줍니다.

**레퍼런스**:
- PRD: [docs/PRD.md](docs/PRD.md) - FEAT-3
- User Flow: [docs/UserFlow.md](docs/UserFlow.md) - 애니 명장면 따라잡기

**구현 내용**:
1. 작품 정보 헤더 (제목, 장면명, 위치)
2. 원본 애니 장면 이미지
3. 실제 장소 사진 갤러리
4. 비교 뷰 (원본 vs 실제)
5. 촬영 팁 섹션
6. 지도에서 위치 보기
7. "내 다이어리에 추가" 버튼
8. "카메라 가이드 모드" 버튼 (Phase 6에서 구현)

**라우팅**: `/themes/[id]`

---

## Phase 5: 새 여행 생성 플로우 개선

### Task 5.1: 새 여행 생성 모달 UI 개선

**설명**: 기존 NewJourneyModal을 디자인 시안에 맞게 개선합니다.

**레퍼런스**:
- 기존 구현: [src/presentation/components/NewJourney/NewJourneyModal.tsx](src/presentation/components/NewJourney/NewJourneyModal.tsx)
- 플랜: [docs/plans/PLAN_new_journey.md](docs/plans/PLAN_new_journey.md)
- Walkthrough: [docs/walkthroughs/WALKTHROUGH_new_journey.md](docs/walkthroughs/WALKTHROUGH_new_journey.md)

**구현 내용**:
1. "Travel Diary" 감성의 모달 스타일 적용
2. 여행 제목 입력
3. 날짜 선택기 개선
4. 공항/출발지 검색 및 선택
5. 일자별 장소 추가 플로우
6. 지도 패널 (좌측 50%)
7. 저장 버튼

---

### Task 5.2: 장소 검색 및 추천 UX 개선

**설명**: 장소 검색 시 맛집 추천 등 컨텍스트 인식 검색을 구현합니다.

**레퍼런스**:
- 플랜: [docs/plans/PLAN_new_journey_refinement.md](docs/plans/PLAN_new_journey_refinement.md)
- Walkthrough: [docs/walkthroughs/WALKTHROUGH_new_journey.md](docs/walkthroughs/WALKTHROUGH_new_journey.md)
- 기존 구현: [src/presentation/components/NewJourney/PlaceSearchSection.tsx](src/presentation/components/NewJourney/PlaceSearchSection.tsx)

**구현 내용**:
1. 엄격한 장소 검증 (텍스트만 입력 불가, 드롭다운에서 선택 필수)
2. 컨텍스트 인식 검색 (마지막 추가된 장소 근처에서 검색)
3. "Top 3 Picks" UI (음식 검색 시)
   - 평점, 사진, 거리 표시
   - 카드 클릭으로 일정에 추가
4. 에러/힌트 메시지 표시

---

### Task 5.3: 상세 경로 계산 및 표시 개선

**설명**: 여행 일정의 경로 계산 결과를 더 상세하게 표시합니다.

**레퍼런스**:
- 플랜: [docs/plans/PLAN_detailed_routing.md](docs/plans/PLAN_detailed_routing.md)
- Walkthrough: [docs/walkthroughs/WALKTHROUGH_detailed_routing.md](docs/walkthroughs/WALKTHROUGH_detailed_routing.md)
- 기존 구현: [src/data/repositories/GoogleRouteRepository.ts](src/data/repositories/GoogleRouteRepository.ts)

**구현 내용**:
1. RouteStep 및 TransitDetails 타입 활용
2. 이동 수단별 상세 정보 표시
   - 전철: 노선명, 색상, 출발/도착 시간, 플랫폼
   - 도보: 예상 시간, 거리
   - 차량: 예상 시간, 거리
3. "티켓 스타일" 이동 정보 카드
4. "Start Planning" → "Your Itinerary" 뷰 전환
5. "Back to Edit" 버튼

---

## Phase 6: 고급 기능

### Task 6.1: 카메라 오버레이 가이드 모드 구현

**설명**: 애니 명장면과 실제 카메라 뷰를 오버레이하여 구도 가이드를 제공합니다.

**레퍼런스**:
- PRD: [docs/PRD.md](docs/PRD.md) - FEAT-3 애니 명장면 따라잡기
- User Flow: [docs/UserFlow.md](docs/UserFlow.md) - 애니 명장면 따라잡기 섹션

**구현 내용**:
1. 카메라 접근 권한 요청
2. 반투명 애니 장면 오버레이
3. 투명도 조절 슬라이더
4. 구도 맞추기 가이드라인
5. 촬영 버튼
6. 비교 샷 콜라주 생성 (원본 | 촬영본)

**기술 고려사항**:
- navigator.mediaDevices.getUserMedia
- Canvas 또는 CSS overlay
- 이미지 합성

---

### Task 6.2: 사진 업로드 및 타임라인 자동 생성 (Magic Timeline)

**설명**: 사진의 메타데이터를 분석하여 자동으로 타임라인을 생성합니다.

**레퍼런스**:
- PRD: [docs/PRD.md](docs/PRD.md) - FEAT-1 AI 사진 자동 타임라인
- User Flow: [docs/UserFlow.md](docs/UserFlow.md) - 여행 기록 생성 섹션

**구현 내용**:
1. 사진 대량 업로드 UI (드래그 앤 드롭)
2. EXIF 메타데이터 파싱 (시간, GPS 좌표)
3. 시간순 정렬 및 그룹핑
4. 위치 기반 장소명 자동 매핑 (Reverse Geocoding)
5. 타임라인 카드 자동 생성
6. 수동 편집 모드

**기술 고려사항**:
- exif-js 또는 piexifjs 라이브러리
- Google Geocoding API
- 로컬 처리 (프라이버시 보호)

---

### Task 6.3: 인스타그램 공유용 이미지 생성 (Instant Share)

**설명**: 여행기를 카드뉴스 형태의 이미지로 변환합니다.

**레퍼런스**:
- PRD: [docs/PRD.md](docs/PRD.md) - FEAT-2 원클릭 인스타 공유
- User Flow: [docs/UserFlow.md](docs/UserFlow.md) - 인스타 공유 섹션
- 디자인 시스템: [docs/DesignSystem.md](docs/DesignSystem.md) - 다이어리 테마

**구현 내용**:
1. 테마 선택 UI (감성/모던/팝)
2. 이미지 비율 선택 (1:1, 9:16)
3. 미리보기 렌더링
4. 다이어리 감성 스타일 적용
   - 종이 질감 배경
   - 손글씨 폰트
   - 폴라로이드 프레임
   - 마스킹 테이프 데코
5. 이미지 다운로드
6. 공유 버튼 (Web Share API)

**기술 고려사항**:
- html2canvas 또는 dom-to-image
- Canvas API
- Web Share API

---

### Task 6.4: 스티커 및 데코 꾸미기 기능

**설명**: 여행 기록에 스티커와 데코레이션을 추가하는 기능입니다.

**레퍼런스**:
- PRD: [docs/PRD.md](docs/PRD.md) - 디자인 & 톤앤매너 섹션
- 디자인 시스템: [docs/DesignSystem.md](docs/DesignSystem.md) - Assets (Stickers)
- DB 설계: [docs/DatabaseDesign.md](docs/DatabaseDesign.md) - sticker_config JSON

**구현 내용**:
1. 스티커 팔레트 UI
   - 마스킹 테이프
   - 빈티지 도장 ("참 잘했어요", "D-Day")
   - 이모지 스티커
2. 드래그 앤 드롭으로 배치
3. 크기 조절 및 회전
4. 스티커 위치/설정 JSON 저장
5. 렌더링 시 스티커 복원

**기술 고려사항**:
- react-draggable 또는 react-rnd
- JSON 직렬화/역직렬화

---

## Phase 7: 백엔드 및 데이터 영속성

### Task 7.1: Supabase 연동 설정

**설명**: Supabase를 백엔드로 연동합니다.

**레퍼런스**:
- TRD: [docs/TRD.md](docs/TRD.md) - 백엔드 & 데이터베이스 섹션
- DB 설계: [docs/DatabaseDesign.md](docs/DatabaseDesign.md)

**구현 내용**:
1. Supabase 프로젝트 설정
2. 환경 변수 구성 (SUPABASE_URL, SUPABASE_ANON_KEY)
3. Supabase 클라이언트 설정 (`src/lib/supabase/`)
4. 기존 LocalStorage Repository를 Supabase로 마이그레이션

---

### Task 7.2: Users 테이블 및 인증 연동

**설명**: Supabase Auth와 사용자 프로필을 연동합니다.

**레퍼런스**:
- DB 설계: [docs/DatabaseDesign.md](docs/DatabaseDesign.md) - users 테이블
- TRD: [docs/TRD.md](docs/TRD.md) - Social Login

**구현 내용**:
1. users 테이블 생성 (id, email, nickname, avatar_url, created_at)
2. Supabase Auth 트리거로 users 자동 생성
3. NextAuth → Supabase Auth 마이그레이션 또는 연동
4. 프로필 수정 기능

---

### Task 7.3: Travels 테이블 구현

**설명**: 여행(다이어리) 데이터를 저장하는 테이블을 구현합니다.

**레퍼런스**:
- DB 설계: [docs/DatabaseDesign.md](docs/DatabaseDesign.md) - travels 테이블

**구현 내용**:
1. travels 테이블 생성
2. SupabaseTravelRepository 구현 (IItineraryRepository)
3. CRUD Use Cases 연동
4. RLS (Row Level Security) 설정

---

### Task 7.4: Timeline Items 및 Photos 테이블 구현

**설명**: 여행 내 일정 아이템과 사진 데이터를 저장합니다.

**레퍼런스**:
- DB 설계: [docs/DatabaseDesign.md](docs/DatabaseDesign.md) - timeline_items, photos 테이블

**구현 내용**:
1. timeline_items 테이블 생성
2. photos 테이블 생성
3. Supabase Storage 설정 (사진 업로드)
4. Repository 구현
5. 이미지 최적화 (리사이징, 압축)

---

### Task 7.5: Anime Spots 테이블 구현

**설명**: 애니메이션 명소 데이터를 저장하는 테이블을 구현합니다.

**레퍼런스**:
- DB 설계: [docs/DatabaseDesign.md](docs/DatabaseDesign.md) - anime_spots 테이블

**구현 내용**:
1. anime_spots 테이블 생성
2. 초기 시드 데이터 입력 (주요 애니메이션 명소)
3. SupabaseAnimeSpotRepository 구현
4. 관리자 전용 CRUD (선택적)

---

## Phase 8: 성능 및 품질 개선

### Task 8.1: 이미지 최적화

**설명**: 이미지 로딩 성능을 최적화합니다.

**레퍼런스**:
- TRD: [docs/TRD.md](docs/TRD.md) - 비기능적 요구사항 (Performance)
- 코딩 컨벤션: [docs/CodingConvention.md](docs/CodingConvention.md) - Images 섹션

**구현 내용**:
1. next/image 컴포넌트 사용 확대
2. Lazy Loading 적용
3. 이미지 placeholder (blur)
4. WebP 포맷 자동 변환
5. Supabase Storage 이미지 변환 활용

---

### Task 8.2: 반응형 디자인 완성

**설명**: 모바일 우선 반응형 디자인을 완성합니다.

**레퍼런스**:
- TRD: [docs/TRD.md](docs/TRD.md) - 반응형 요구사항
- 코딩 컨벤션: [docs/CodingConvention.md](docs/CodingConvention.md) - Mobile First

**구현 내용**:
1. 모든 페이지 모바일 뷰 점검
2. 터치 인터랙션 최적화
3. 모바일 네비게이션 (햄버거 메뉴)
4. 데스크탑 다이어리 펼침 뷰 (Dual View)

---

### Task 8.3: E2E 테스트 작성

**설명**: 핵심 사용자 시나리오에 대한 E2E 테스트를 작성합니다.

**레퍼런스**:
- 코딩 컨벤션: [docs/CodingConvention.md](docs/CodingConvention.md) - 테스트 전략
- User Flow: [docs/UserFlow.md](docs/UserFlow.md)

**구현 내용**:
1. Playwright 설정
2. 테스트 시나리오:
   - 로그인 → 새 여행 생성 → 저장
   - 저장된 여행 조회 → 편집 → 저장
   - 테마 여행 탐색 → 상세 보기
   - 사진 업로드 → 타임라인 생성 → 공유 이미지 다운로드

---

### Task 8.4: 다크 모드 완성

**설명**: 전체 앱에 다크 모드를 적용합니다.

**레퍼런스**:
- 디자인: 각 design/*.html 파일의 dark: 클래스 참조
- UI 가이드: [docs/ui_style_guide.md](docs/ui_style_guide.md)

**구현 내용**:
1. 다크 모드 토글 버튼 추가
2. 시스템 설정 연동 (prefers-color-scheme)
3. 모든 컴포넌트 다크 모드 스타일 점검
4. LocalStorage에 테마 설정 저장

---

### Task 8.5: 오프라인 지원 (PWA)

**설명**: PWA로 오프라인 기본 지원을 추가합니다.

**레퍼런스**:
- TRD: [docs/TRD.md](docs/TRD.md) - 프론트엔드 섹션 (PWA)

**구현 내용**:
1. next-pwa 설정
2. Service Worker 구성
3. manifest.json 작성
4. 오프라인 fallback 페이지
5. 캐시 전략 설정

---

## 태스크 우선순위 요약

| 우선순위 | Phase | 설명 |
|---------|-------|------|
| P0 | Phase 1 | 기반 UI 구현 (홈, 사이드바, 헤더) |
| P0 | Phase 2 | 여정 페이지 구현 |
| P1 | Phase 3 | 저장된 장소 페이지 |
| P1 | Phase 4 | 테마 여행 페이지 |
| P1 | Phase 5 | 새 여행 생성 플로우 개선 |
| P2 | Phase 6 | 고급 기능 (카메라 오버레이, 자동 타임라인, 공유) |
| P2 | Phase 7 | Supabase 백엔드 연동 |
| P3 | Phase 8 | 성능 및 품질 개선 |

---

## 참고 사항

1. 모든 태스크는 Clean Architecture 원칙을 따릅니다.
2. 새로운 기능 추가 시 [CLAUDE.md](CLAUDE.md)의 가이드라인을 참조하세요.
3. UI 구현 시 해당 디자인 HTML 파일을 직접 참조하여 스타일을 적용하세요.
4. 기존에 구현된 컴포넌트와 Use Case를 최대한 재활용하세요.
