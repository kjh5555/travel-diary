# ✈️ Travel Diary (나만의 여행 스크랩북)

> "여행의 순간을 감성적으로 기록하고, 애니메이션 속 장면처럼 특별한 추억을 남기세요."

![Project Banner](/public/assets/banner-placeholder.png)
*스크린샷이나 배너 이미지를 이곳에 추가해주세요.*

## 📖 프로젝트 소개
**Travel Diary**는 단순한 여행 일정 관리를 넘어, 여행의 감동과 추억을 나만의 스크랩북처럼 아름답게 기록하고 공유할 수 있는 웹 애플리케이션입니다. 

여행 전 **일정 계획**부터 여행 중 **실시간 기록**, 그리고 여행 후 **추억 아카이빙**까지 여행의 모든 과정을 하나의 감성적인 다이어리로 완성할 수 있습니다. 특히 '이루고 싶은 여행 로망'인 애니메이션 성지순례나 테마 여행지 정보를 제공하여 특별한 여행 경험을 선사합니다.

### 🎯 주요 타겟 및 목표
- **타겟 유저**: 여행의 기록을 소중히 여기고, 감성적인 아카이빙을 즐기는 여행자.
- **핵심 가치**: 힐링(Healing), 기록(Archiving), 공유(Sharing).

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
- **Framework**: ![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat&logo=next.js) (App Router)
- **Library**: ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react)
- **Styling**: ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat&logo=tailwindcss)
- **State Management**: ![Zustand](https://img.shields.io/badge/Zustand-orange?style=flat)

### Backend & Database
- **Database**: ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat&logo=postgresql)
- **ORM**: ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma)
- **Authentication**: ![NextAuth.js](https://img.shields.io/badge/NextAuth.js-000000?style=flat)

### Tools & DevOps
- **Language**: ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript)
- **Testing**: ![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest)
- **Maps**: Google Maps API

---

## ✨ 주요 기능 (Key Features)

### 1. 🗺️ 여행 일정 계획 (Journey Planning)
- **직관적인 일정 관리**: 드래그 앤 드롭으로 손쉽게 일정을 계획하고 수정할 수 있습니다.
- **지도 연동**: 구글 지도와 연동되어 여행 동선을 시각적으로 확인할 수 있습니다.
- **교통편 아이콘**: 이동 수단에 따른 맞춤형 아이콘 제공.

### 2. 📔 여행 스크랩북 & 기록 (Memories & Scrapbook)
- **감성 기록**: 사진, 텍스트, 스티커를 활용해 다이어리를 꾸미듯 여행을 기록합니다.
- **자동 타임라인**: 사진의 메타데이터를 활용해 여행 동선을 자동으로 정리해줍니다.

### 3. 🎬 테마 여행 & 성지순례 (Anime & Theme Spots)
- **애니메이션 스팟**: 좋아하는 애니메이션의 배경이 된 장소 정보를 제공하고, 실제 장소와 비교샷을 남길 수 있습니다.
- **테마 큐레이션**: '힐링', '카페', '야경' 등 다양한 테마별 여행지를 추천합니다.

### 4. 🤝 소셜 & 공유 (Social Sharing)
- **친구 맺기**: 함께 여행한 친구를 태그하고 추억을 공유할 수 있습니다.
- **일정 공유**: 내가 만든 알찬 여행 일정을 다른 사람들에게 공유하거나, 친구의 일정을 참고할 수 있습니다.

---

## 🚀 시작하기 (Getting Started)

### 사전 요구사항
- Node.js (v18 이상 권장)
- npm 또는 yarn, pnpm
- PostgreSQL 데이터베이스

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/username/travel-diary.git
   cd travel-diary
   ```

2. **패키지 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   `.env` 파일을 생성하고 필요한 환경 변수(DB URL, Google Maps Key 등)를 입력하세요.
   ```bash
   cp .env.example .env
   # .env 파일 수정
   ```

4. **데이터베이스 마이그레이션**
   ```bash
   npm run db:migrate
   ```

5. **개발 서버 실행**
   ```bash
   npm run dev
   ```
   브라우저에서 `http://localhost:3000`으로 접속하여 확인하세요.

---

## 📂 프로젝트 구조 (Project Structure)

```
src/
├── app/              # Next.js App Router 페이지
├── components/       # 재사용 가능한 UI 컴포넌트
├── domain/           # 비즈니스 로직 및 모델
├── presentation/     # 뷰 계층 및 뷰 모델
├── data/             # 데이터 페칭 및 API 클라이언트
├── lib/              # 유틸리티 함수 및 설정
└── types/            # TypeScript 타입 정의
```

---

## 📝 라이선스
This project is licensed under the MIT License.
