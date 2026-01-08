---
trigger: always_on
---

# Travel Planner - Clean Architecture Documentation

## 프로젝트 개요
이 프로젝트는 **Clean Architecture** 원칙을 따르는 여행 계획 웹 애플리케이션입니다.
Next.js, TypeScript, Google Maps API를 활용하여 여행 일정을 계획하고 관리할 수 있습니다.

---

## 아키텍처 구조

```
src/
├── domain/              # 비즈니스 로직 계층 (최내부, 의존성 없음)
├── data/                # 데이터 계층 (domain에 의존)
├── presentation/        # 프레젠테이션 계층 (domain과 data에 의존)
├── app/                 # Next.js App Router (presentation에 의존)
└── tests/               # 통합 테스트
```

### 의존성 규칙 (Dependency Rule)
```
app → presentation → data → domain
                      ↓
              (domain은 아무것도 의존하지 않음)
```

---

## 1. Domain Layer (도메인 계층)

**위치**: `src/domain/`

**역할**: 비즈니스 로직과 규칙을 담당. 외부 프레임워크나 라이브러리에 의존하지 않음.

### 구조:
```
domain/
├── entities/           # 비즈니스 엔티티
│   └── User.ts
├── types/              # 도메인 타입 정의
│   ├── place.ts
│   ├── itinerary.ts
│   └── recommendation.ts
├── repositories/       # Repository 인터페이스 (추상화)
│   ├── IPlaceRepository.ts
│   ├── IItineraryRepository.ts
│   └── IAuthRepository.ts
└── usecases/           # 비즈니스 유스케이스
    ├── place/
    │   ├── SearchPlacesUseCase.ts
    │   ├── GetPlaceDetailsUseCase.ts
    │   ├── FindSimilarPlacesUseCase.ts
    │   ├── GetRecommendationsUseCase.ts
    │   └── CheckOpenNowUseCase.ts
    ├── itinerary/
    │   ├── AddToItineraryUseCase.ts
    │   ├── RemoveFromItineraryUseCase.ts
    │   └── CalculateRouteUseCase.ts
    └── auth/
        ├── SignInUseCase.ts
        ├── SignOutUseCase.ts
        └── GetSessionUseCase.ts
```

### 주요 개념:

#### 1.1 Entities (엔티티)
비즈니스의 핵심 개념을 나타내는 객체
```typescript
// src/domain/entities/User.ts
export class User {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly name: string
    ) {}
}
```

#### 1.2 Types (타입)
도메인에서 사용하는 데이터 구조
```typescript
// src/domain/types/place.ts
export interface Place {
    id: string;
    name: string;
    address: string;
    location: { lat: number; lng: number };
    rating?: number;
    photos?: string[];
    types?: string[];
}
```

#### 1.3 Repository Interfaces (저장소 인터페이스)
데이터 접근을 추상화. 구현체는 Data Layer에 위치
```typescript
// src/domain/repositories/IPlaceRepository.ts
export interface IPlaceRepository {
    searchPlaces(query: string, location?: { lat: number, lng: number }): Promise<Place[]>;
    getPlaceDetails(placeId: string): Promise<Place | null>;
}
```

#### 1.4 Use Cases (유스케이스)
단일 비즈니스 작업을 수행. Repository를 의존성 주입으로 받음
```typescript
// src/domain/usecases/place/SearchPlacesUseCase.ts
export class SearchPlacesUseCase {
    constructor(private repository: IPlaceRepository) {}

    async execute(query: string, location?: { lat: number, lng: number }): Promise<Place[]> {
        if (!query || query.trim().length === 0) {
            throw new Error("Search query cannot be empty");
        }
        return await this.repository.searchPlaces(query.trim(), location);
    }
}
```

---

## 2. Data Layer (데이터 계층)

**위치**: `src/data/`

**역할**: Domain의 Repository 인터페이스를 구현. 외부 API, DB 등과 통신.

### 구조:
```
data/
├── repositories/       # Repository 구현체
│   ├── GooglePlaceRepository.ts
│   ├── GoogleRouteRepository.ts
│   └── NextAuthRepository.ts
└── google-maps/        # Google Maps 관련 유틸리티
    └── useGoogleMaps.ts
```

### 주요 개념:

#### 2.1 Repository Implementation
Domain의 인터페이스를 실제로 구현
```typescript
// src/data/repositories/GooglePlaceRepository.ts
export class GooglePlaceRepository implements IPlaceRepository {
    private service: google.maps.places.PlacesService;

    constructor(mapDiv: HTMLDivElement | google.maps.Map) {
        this.service = new google.maps.places.PlacesService(mapDiv);
    }

    async searchPlaces(query: string, location?: { lat: number, lng: number }): Promise<Place[]> {
        // Google Places API 호출
        return new Promise((resolve, reject) => {
            this.service.textSearch(request, (results, status) => {
                // ... 구현
            });
        });
    }
}
```

#### 2.2 External API Integration
외부 서비스와의 통신을 담당
- Google Maps API (Places, Routes)
- NextAuth (인증)

---

## 3. Presentation Layer (프레젠테이션 계층)

**위치**: `src/presentation/`

**역할**: UI 컴포넌트, 상태 관리, 사용자 인터랙션 처리.

### 구조:
```
presentation/
├── components/         # React 컴포넌트
│   ├── Map/
│   │   ├── MapContainer.tsx
│   │   └── PlaceSearch.tsx
│   ├── Place/
│   │   ├── PlaceDetailsCard.tsx
│   │   └── SimilarPlacesRecommendation.tsx
│   ├── Itinerary/
│   │   └── ItineraryTimeline.tsx
│   ├── Recommendations/
│   │   └── RecommendationList.tsx
│   ├── NewJourney/
│   │   └── NewJourneyModal.tsx
│   ├── Header.tsx
│   └── Sidebar.tsx
├── hooks/              # Custom React Hooks
├── providers/          # Context Providers
│   └── NextAuthProvider.tsx
└── store/              # 상태 관리 (Zustand 등)
```

### 주요 개념:

#### 3.1 컴포넌트 구조
- **Container 컴포넌트**: 비즈니스 로직 처리, Use Case 호출
- **Presentational 컴포넌트**: UI만 담당

#### 3.2 Use Case 호출 패턴
```typescript
// src/presentation/components/NewJourney/NewJourneyModal.tsx
const [searchUseCase, setSearchUseCase] = useState<SearchPlacesUseCase | null>(null);

useEffect(() => {
    // Repository 인스턴스 생성
    const placeRepo = new GooglePlaceRepository();
    // Use Case에 Repository 주입
    const useCase = new SearchPlacesUseCase(placeRepo);
    setSearchUseCase(useCase);
}, []);

const handleSearch = async () => {
    if (!searchUseCase) return;
    const results = await searchUseCase.execute(query, location);
    // ... 결과 처리
};
```

#### 3.3 폴더별 책임
- **Map/**: 지도 관련 컴포넌트
- **Place/**: 장소 상세 정보, 추천
- **Itinerary/**: 여행 일정 타임라인
- **NewJourney/**: 새 여행 계획 모달 (다중일 지원)

---

## 4. App Layer (Next.js App Router)

**위치**: `src/app/`

**역할**: 라우팅, 페이지 구성, API 엔드포인트.

### 구조:
```
app/
├── page.tsx            # 홈 페이지
├── layout.tsx          # 루트 레이아웃
├── planner/
│   └── page.tsx        # 여행 계획 페이지
├── map/
│   └── page.tsx        # 지도 페이지
└── api/
    └── auth/
        └── [...nextauth]/
            └── route.ts  # NextAuth API 라우트
```

---

## 코딩 가이드라인

### 1. 새로운 기능 추가 시

#### Step 1: Domain Layer 작업
1. **Type 정의** (필요시)
   ```typescript
   // src/domain/types/newFeature.ts
   export interface NewFeature {
       id: string;
       // ...
   }
   ```

2. **Repository Interface 정의**
   ```typescript
   // src/domain/repositories/INewFeatureRepository.ts
   export interface INewFeatureRepository {
       getFeature(id: string): Promise<NewFeature>;
   }
   ```

3. **Use Case 생성**
   ```typescript
   // src/domain/usecases/newFeature/GetFeatureUseCase.ts
   export class GetFeatureUseCase {
       constructor(private repository: INewFeatureRepository) {}

       async execute(id: string): Promise<NewFeature> {
           // 비즈니스 로직
           return await this.repository.getFeature(id);
       }
   }
   ```

#### Step 2: Data Layer 작업
4. **Repository 구현**
   ```typescript
   // src/data/repositories/NewFeatureRepository.ts
   export class NewFeatureRepository implements INewFeatureRepository {
       async getFeature(id: string): Promise<NewFeature> {
           // API 호출 등 실제 구현
       }
   }
   ```

#### Step 3: Presentation Layer 작업
5. **컴포넌트 생성**
   ```typescript
   // src/presentation/components/NewFeature/FeatureComponent.tsx
   export const FeatureComponent = () => {
       const [useCase, setUseCase] = useState<GetFeatureUseCase | null>(null);

       useEffect(() => {
           const repo = new NewFeatureRepository();
           setUseCase(new GetFeatureUseCase(repo));
       }, []);

       // UI 로직
   };
   ```

#### Step 4: App Layer 통합
6. **페이지에서 사용**
   ```typescript
   // src/app/feature/page.tsx
   import { FeatureComponent } from '@/presentation/components/NewFeature/FeatureComponent';

   export default function FeaturePage() {
       return <FeatureComponent />;
   }
   ```

### 2. 의존성 주입 패턴

항상 **의존성 주입(Dependency Injection)**을 사용:

```typescript
// ✅ 좋은 예: 생성자를 통한 의존성 주입
export class SearchPlacesUseCase {
    constructor(private repository: IPlaceRepository) {}

    async execute(query: string): Promise<Place[]> {
        return this.repository.searchPlaces(query);
    }
}

// ❌ 나쁜 예: 직접 구현체 생성
export class SearchPlacesUseCase {
    async execute(query: string): Promise<Place[]> {
        const repo = new GooglePlaceRepository(); // 구현체에 직접 의존
        return repo.searchPlaces(query);
    }
}
```

### 3. 테스트 작성

각 계층별로 테스트 작성:

```typescript
// src/domain/usecases/place/__tests__/SearchPlacesUseCase.test.ts
describe('SearchPlacesUseCase', () => {
    it('should search places', async () => {
        const mockRepo: IPlaceRepository = {
            searchPlaces: jest.fn().mockResolvedValue([mockPlace])
        };

        const useCase = new SearchPlacesUseCase(mockRepo);
        const result = await useCase.execute('coffee');

        expect(result).toHaveLength(1);
        expect(mockRepo.searchPlaces).toHaveBeenCalledWith('coffee');
    });
});
```

### 4. 파일 명명 규칙

- **Use Cases**: `{Action}{Entity}UseCase.ts` (예: `SearchPlacesUseCase.ts`)
- **Repositories**: `{DataSource}{Entity}Repository.ts` (예: `GooglePlaceRepository.ts`)
- **Interfaces**: `I{Entity}Repository.ts` (예: `IPlaceRepository.ts`)
- **Components**: `{Feature}{Type}.tsx` (예: `NewJourneyModal.tsx`)
- **Types**: `{entity}.ts` (소문자, 예: `place.ts`)

### 5. Import 경로

절대 경로 사용 (`@/` 별칭):

```typescript
// ✅ 좋은 예
import { Place } from "@/domain/types/place";
import { SearchPlacesUseCase } from "@/domain/usecases/place/SearchPlacesUseCase";

// ❌ 나쁜 예
import { Place } from "../../../domain/types/place";
```

### 6. 비동기 처리

모든 외부 호출은 `async/await` 사용:

```typescript
// ✅ 좋은 예
const handleSearch = async () => {
    try {
        const results = await searchUseCase.execute(query);
        setResults(results);
    } catch (error) {
        console.error("Search failed:", error);
    }
};

// ❌ 나쁜 예
const handleSearch = () => {
    searchUseCase.execute(query).then(results => {
        setResults(results);
    });
};
```

---

## 현재 구현된 주요 기능

### 1. 장소 검색 및 상세 정보
- **Use Cases**: `SearchPlacesUseCase`, `GetPlaceDetailsUseCase`
- **Repository**: `GooglePlaceRepository`
- **Components**: `PlaceSearch`, `PlaceDetailsCard`

### 2. 여행 일정 계획
- **Use Cases**: `AddToItineraryUseCase`, `RemoveFromItineraryUseCase`, `CalculateRouteUseCase`
- **Repository**: `GoogleRouteRepository`
- **Components**: `NewJourneyModal`, `ItineraryTimeline`

### 3. 장소 추천
- **Use Cases**: `GetRecommendationsUseCase`, `FindSimilarPlacesUseCase`
- **Repository**: `GooglePlaceRepository`
- **Components**: `RecommendationList`, `SimilarPlacesRecommendation`

### 4. 인증
- **Use Cases**: `SignInUseCase`, `SignOutUseCase`, `GetSessionUseCase`
- **Repository**: `NextAuthRepository`
- **Provider**: `NextAuthProvider`

---

## 주요 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest, React Testing Library
- **Maps**: Google Maps JavaScript API
- **Auth**: NextAuth.js
- **State**: React Hooks, Zustand (필요시)

---

## 개발 시 체크리스트

새로운 기능 개발 시 다음을 확인:

- [ ] Domain Layer에 타입/인터페이스 정의
- [ ] Use Case 작성 (비즈니스 로직 분리)
- [ ] Repository 인터페이스 정의
- [ ] Data Layer에 Repository 구현
- [ ] Presentation Layer에 컴포넌트 작성
- [ ] 의존성 주입 패턴 사용
- [ ] 단위 테스트 작성
- [ ] 절대 경로 import 사용
- [ ] 에러 핸들링 구현
- [ ] 타입 안정성 확보 (any 지양)

---

## 예시: 전체 흐름

사용자가 "커피숍"을 검색하는 경우:

1. **Presentation**: `PlaceSearch` 컴포넌트에서 검색어 입력
2. **Presentation**: `SearchPlacesUseCase.execute("커피숍")` 호출
3. **Domain**: Use Case가 유효성 검증 후 `IPlaceRepository.searchPlaces()` 호출
4. **Data**: `GooglePlaceRepository`가 Google Places API에 요청
5. **Data**: API 응답을 `Place[]` 타입으로 변환
6. **Domain**: Use Case가 결과 반환
7. **Presentation**: 컴포넌트가 결과를 state에 저장하고 UI 업데이트

```
User Input → Component → Use Case → Repository Interface → Repository Implementation → External API
             ↓                                                                              ↓
         UI Update ← State Update ← Return Data ← Transform Data ← API Response
```

---

## 참고 자료

- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bo