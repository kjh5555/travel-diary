# Coding Convention & AI Collaboration Guide

## 1. 핵심 원칙 (Core Principles)
*   **"Component Driven"**: 모든 UI는 재사용 가능한 컴포넌트 단위로 쪼갭니다.
*   **"Types First"**: 코드를 작성하기 전에 인터페이스(Type)를 먼저 정의합니다.
*   **"Mobile First"**: CSS 스타일링은 모바일 뷰포트를 기본으로 작성하고, 미디어 쿼리로 데스크탑을 대응합니다.

## 2. 프로젝트 구조 (File Structure)
```
src/
├── app/                 # Next.js App Router Pages
├── components/          # Shared Components
│   ├── ui/              # Atom level (Button, Input...)
│   ├── domain/          # Business level (TimelineItem, MapView...)
│   └── layout/          # Header, Footer
├── lib/                 # Utilities
│   ├── supabase/        # Supabase Client
│   └── utils.ts         # Helper functions
├── hooks/               # Custom React Hooks
└── types/               # Global Interface Definitions
```

## 3. 네이밍 규칙 (Naming Conventions)
*   **Files**: `PascalCase.tsx` (컴포넌트), `camelCase.ts` (유틸리티/훅).
*   **Components**: 파일명과 동일한 `PascalCase` 사용.
*   **Interfaces**: `I` 접두어 사용 금지. (ex: `User` O, `IUser` X). Props는 `[Component]Props` 형태 (ex: `ButtonProps`).

## 4. AI 협업 가이드 (Prompt Engineering)
AI 파트너에게 코드를 요청할 때 다음 형식을 준수하세요:

> "현재 `DesignSystem.md`의 'Primary Button' 스타일을 참고하여, `FollowButton.tsx` 컴포넌트를 만들어줘. Tailwind CSS를 사용하고, 클릭 시 로딩 상태를 처리해줘."

*   **명확한 레퍼런스**: 항상 스타일은 `DesignSystem.md`, 로직은 `TRD.md`를 참조하라고 지시합니다.
*   **단계별 요청**: 한 번에 전체 페이지를 요청하지 말고, 섹션별 혹은 컴포넌트별로 나누어 요청합니다.

## 5. 코드 품질 및 보안 (Quality & Security)
*   **React Server Components (RSC)**: 가능한 한 서버 컴포넌트를 기본으로 사용하고, 상호작용이 필요한 경우에만 `"use client"`를 명시합니다.
*   **Key Management**: API Key 등 민감 정보는 반드시 `.env.local`로 관리하고 Git에 올리지 않습니다.
*   **Images**: `next/image`를 사용하여 이미지 최적화(Lazy Load, WebP 변환)를 자동 적용합니다.

## 6. 테스트 전략 (Testing)
*   일단 빠른 MVP 출시를 위해 **단위 테스트(Jest)**보다는 **E2E 테스트(Playwright)** 위주로 핵심 시나리오(로그인 -> 작성 -> 공유)를 검증합니다.
