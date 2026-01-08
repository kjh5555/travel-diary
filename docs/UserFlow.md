# User Flow: Travel Scrapbook

## 핵심 사용자 흐름 (Core User Journeys)

### 1. 여행 기록 생성 (AI Auto-Timeline)
사용자가 여행 후 사진을 업로드하여 타임라인을 자동 생성하는 흐름입니다.

```mermaid
graph TD
    Start([시작: 홈 화면]) --> LoginCheck{로그인 여부}
    LoginCheck -->|No| Landing[랜딩 페이지] --> SocialLogin[소셜 로그인]
    LoginCheck -->|Yes| Dashboard[나의 서재 (메인)]
    
    Dashboard --> ClickNew[+ 새 다이어리 만들기]
    ClickNew --> UploadPhotos[사진 대량 업로드]
    
    UploadPhotos --> Processing{메타데이터 분석 (Local/AI)}
    Processing -->|Success| AutoGen[타임라인 자동 생성 완료]
    
    AutoGen --> EditMode[편집 모드 진입]
    EditMode --> AddSticker[마스킹 테이프/스티커 꾸미기]
    EditMode --> AddMemo[감성 메모 작성]
    EditMode --> Save([저장 및 발행])
```

### 2. 애니 명장면 따라잡기 (Anime Pilgrimage)
특정 장소에서 애니메이션 장면을 오버레이하여 사진을 촬영하는 흐름입니다.

```mermaid
graph TD
    StartSpot([장소 탐색]) --> SelectSpot[애니 명소 선택]
    SelectSpot --> ViewDetail[상세 정보 & 원본 장면 확인]
    
    ViewDetail --> CameraMode[📸 가이드 카메라 실행]
    CameraMode --> OverlayOn[반투명 장면 오버레이]
    OverlayOn --> UserAdjust[구도 맞추기]
    UserAdjust --> Snap[촬영 찰칵]
    
    Snap --> CompareResult[비교 샷 생성 (Collage)]
    CompareResult --> SaveToDiary[내 다이어리에 추가]
```

### 3. 인스타 공유 (Instant Share)
완성된 여행기를 이미지로 변환하여 공유하는 흐름입니다.

```mermaid
graph TD
    ViewDiary([다이어리 보기]) --> ClickShare[공유 버튼 클릭]
    ClickShare --> SelectTheme[테마 선택 (감성/모던/팝)]
    
    SelectTheme --> Preview[이미지 미리보기 (1:1 / 9:16)]
    Preview --> Download[이미지 다운로드]
    Download --> ToInsta([인스타그램 열기])
```
