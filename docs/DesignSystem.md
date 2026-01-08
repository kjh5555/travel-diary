# Design System: Travel Scrapbook (Analog Vibe)

## 1. Design Concept
*   **Keywords**: Analog, Warm, Tactile, Nostalgic
*   **Metaphor**: 오래된 서랍 속에서 꺼낸 손때 묻은 여행 노트

## 2. Color Palette

### Primary (Paper & Ink)
*   **Paper Base**: `#F9F5E7` (따뜻한 미색 종이 질감 배경)
*   **Vintage Ink**: `#2C3E50` (완전한 검정이 아닌, 빛 바랜 잉크색 텍스트)
*   **Accent (Tape)**: `#E07A5F` (중요 포인트용 마스킹 테이프 색상)

### Secondary (Mood)
*   **Calm Green**: `#81B29A` (자연, 힐링)
*   **Soft Blue**: `#A8DADC` (하늘, 물)
*   **Warning (Eraser)**: `#E63946` (삭제, 취소)

## 3. Typography
*   **Headings (Title)**: *'Maru Buri'* (마루부리) or *'Nanum Myeongjo'* - 서정적인 명조체
*   **Body (Content)**: *'Kyobo Hand'* (교보손글씨) or *'Naver Nanum Pen'* - 실제 펜으로 쓴 듯한 손글씨체
*   **UI (Button/Nav)**: *'Pretendard'* - 가독성을 위해 UI 요소에는 깔끔한 고딕체 사용

## 4. Components

### 4.1 Buttons (Stamp Style)
*   **Primary Button**: 우표나 도장처럼 테두리가 오톨도톨하거나 약간 기울어지는 효과.
    *   Hover: 살짝 눌리는(Scale 0.95) 애니메이션.
*   **Secondary Button**: 밑줄만 있는 텍스트 링크 스타일.

### 4.2 Cards (Polaroid)
*   흰색 테두리가 넓고 하단에 캡션 공간이 있는 폴라로이드 형태.
*   약간의 Drop Shadow로 종이 위에 떠 있는 느낌 구현.
*   CSS `transform: rotate()`를 랜덤하게 적용하여 자연스럽게 흩뿌려진 느낌 연출.

### 4.3 Inputs (Underline)
*   박스 형태(`border: 1px solid`)를 지양하고, 노트 밑줄(`border-bottom`) 스타일 사용.
*   Focus 시 펜으로 선을 긋는 듯한 애니메이션 (`width: 0 -> 100%`).

## 5. Assets (Stickers)
*   **Tape**: 반투명한 마스킹 테이프 이미지 (PNG).
*   **Stamp**: "참 잘했어요", "D-Day", "Departure" 등 빈티지 도장.
*   **Paper Texture**: 전체 배경에 `opacity: 0.1` 정도의 노이즈 질감 오버레이 필수.
