# TRD: Travel Scrapbook (기술 요구사항 정의서)

## 1. 시스템 아키텍처 (System Architecture)

```mermaid
graph TD
    User[사용자 (Mobile/PC Browser)]
    Frontend[Next.js Web App (PWA)]
    Backend[Supabase (BaaS)]
    Storage[Local Storage / IndexedDB]
    ExtMap[Google Maps API]
    
    User -->|접속| Frontend
    Frontend -->|Auth/Data| Backend
    Frontend -->|지도 로딩| ExtMap
    Frontend -->|임시/오프라인 데이터| Storage
    
    subgraph "Serverless Infrastructure"
        Backend --> Auth[Authentication (Kakao/Google)]
        Backend --> DB[PostgreSQL Database]
        Backend --> FileStore[Storage (User Photos)]
    end
```

## 2. 권장 기술 스택 (Tech Stack)

### 2.1 프론트엔드 (Frontend)
*   **기술**: **Next.js (React)**
*   **선택 이유**:
    *   **Web First & PWA**: 웹으로 시작하지만 모바일 앱 같은 경험(PWA)을 제공하기에 최적.
    *   **SEO**: 검색 엔진 노출 유리 (여행기 공유 시 중요).
    *   **생태계**: 다양한 UI 라이브러리 및 최적화 도구 풍부.
*   **리스크**: 초기 로딩 속도 최적화 필요 (SSG/SSR 적절히 활용).

### 2.2 백엔드 & 데이터베이스 (Backend & DB)
*   **기술**: **Supabase** (PostgreSQL 기반 BaaS)
*   **선택 이유**:
    *   **Serverless**: 서버 관리 불필요, 초기 비용 0원 (Free Tier).
    *   **기능 통합**: DB, 인증(Auth), 스토리지, 실시간 구독이 올인원으로 제공됨.
    *   **SQL Power**: 관계형 데이터(여행-일자-장소-사진)를 다루기에 NoSQL보다 적합.
*   **대안**: Firebase (NoSQL이라 관계형 데이터 모델링이 복잡할 수 있음).

### 2.3 배포 및 호스팅 (Deployment)
*   **플랫폼**: **Vercel**
*   **선택 이유**: Next.js 개발사가 만든 플랫폼으로 최적의 궁합과 DX(개발자 경험) 제공. 무료 취미 요금제 사용 가능.

### 2.4 외부 API
*   **Google Maps JavaScript API**: 전 세계 장소 검색, 지도 표시, 핀 클러스터링.
*   **Social Login**: Kakao SDK, Google OAuth (Supabase Auth 연동).

## 3. 비기능적 요구사항 (Non-functional Requirements)
*   **성능 (Performance)**:
    *   메인 타임라인 페이지에서 사진 로딩 시 **Lazy Loading** 필수 적용.
    *   LCP (Largest Contentful Paint) 2.5초 이내 목표.
*   **프라이버시 (Privacy)**:
    *   **Local Storage** 우선 정책: 작성 중인 데이터는 로컬에 우선 저장, 사용자 동의 하에만 클라우드 동기화.
    *   사진 메타데이터(Exif)에서 위치 정보 추출 시 사용자 브라우저 권한 승인 절차 필수.
*   **반응형 (Responsive)**:
    *   Mobile Portrait (세로) 뷰 최우선 설계.
    *   Desktop에서는 여백을 활용한 다이어리 펼침 뷰(Dual View) 고려.

## 4. 데이터베이스 요구사항 (Database Requirements)
*   **테이블 설계 원칙**: 정규화(Normalization)를 준수하되, 읽기 성능을 위해 필요한 경우 역정규화 허용.
*   **인덱싱 (Indexing)**:
    *   여행기 검색 속도를 위해 `user_id`, `created_at`, `location` 컬럼에 인덱스 적용.
*   **키 (Keys)**: 모든 테이블은 UUID v4를 Primary Key로 사용 (보안 및 분산 환경 고려).

## 5. 데이터 생명주기 (Data Lifecycle)
*   **수집**: 회원가입 시 최소 정보(이메일, 닉네임)만 수집. 사진 위치 정보는 휘발성 메모리 또는 로컬에서만 처리 권장.
*   **보관**: 사용자가 탈퇴하지 않는 한 영구 보관 (클라우드 동기화 시). 로컬 데이터는 브라우저 캐시 정책 따름.
*   **파기**: 회원 탈퇴 시 Supabase Edge Function 트리거를 통해 관련 모든 데이터(DB Row + Storage File) **Hard Delete**.
