# Korean Running Schedule App

## 프로젝트 개요
이 앱은 한국의 마라톤 및 러닝 대회 일정을 보여주는 React Native 애플리케이션입니다. 외부 API에서 실시간으로 대회 정보를 가져와 월별로 필터링하여 표시합니다.

## 기술 스택
- **React Native** (0.79.4) with **Expo SDK 53**
- **TypeScript** (5.8.3)
- **React** (19.0.0)
- **Expo Status Bar** & **Safe Area Context**

## 프로젝트 구조
```
kr-running-schedule-app/
├── App.tsx                 # 메인 앱 컴포넌트
├── components/            
│   ├── EventCard.tsx      # 개별 대회 카드 컴포넌트
│   └── MonthFilter.tsx    # 월 선택 필터 컴포넌트
├── services/
│   └── marathonApi.ts     # API 통신 및 데이터 변환
├── types/
│   └── index.ts           # TypeScript 타입 정의
├── assets/                # 앱 아이콘 및 이미지
├── app.json              # Expo 설정
├── eas.json              # EAS Build 설정
├── package.json          # 프로젝트 의존성
└── tsconfig.json         # TypeScript 설정
```

## 주요 기능
1. **실시간 대회 정보 로딩**: GitHub에 호스팅된 JSON API에서 마라톤 데이터 fetch
2. **월별 필터링**: 수평 스크롤 가능한 월 선택기로 대회 필터링
3. **자동 스크롤**: 앱 시작 시 현재 날짜와 가장 가까운 대회로 자동 스크롤
4. **에러 처리**: 네트워크 오류 및 로딩 상태 관리
5. **반응형 UI**: 카드 기반의 직관적인 대회 정보 표시

## 데이터 흐름
1. `marathonApi.ts`에서 외부 API 호출 (`https://raw.githubusercontent.com/pilyeooong/kr-marathon-schedule/refs/heads/master/marathon_data/latest-marathon-schedule.json`)
2. `MarathonEvent` 형식을 `RunningEvent` 형식으로 변환
3. `App.tsx`에서 상태 관리 및 월별 필터링 로직 처리
4. 필터링된 이벤트를 `FlatList`로 렌더링

## 컴포넌트 설명

### App.tsx
- **상태 관리**: 
  - `allEvents`: 모든 대회 정보
  - `loading`: 로딩 상태
  - `error`: 에러 상태
  - `selectedMonth`: 선택된 월
  - `isInitialLoad`: 초기 로드 여부
- **주요 함수**:
  - `loadMarathonEvents()`: API에서 대회 정보 로드
  - `scrollToNearestEvent()`: 가장 가까운 대회로 스크롤
  - `filteredEvents`: 선택된 월의 대회만 필터링

### EventCard.tsx
대회 정보를 표시하는 카드 컴포넌트:
- 날짜 (년-월-일, 요일)
- 대회명
- 주최자
- 거리 (풀코스, 하프, 10K 등)
- 위치
- 연락처

### MonthFilter.tsx
월 선택 필터 컴포넌트:
- 수평 스크롤 가능
- 선택된 월 하이라이트
- 자동 중앙 정렬

### marathonApi.ts
API 통신 및 데이터 변환:
- `fetchMarathonEvents()`: 외부 API에서 데이터 fetch
- `transformMarathonToRunningEvent()`: 데이터 형식 변환

## 빌드 및 실행

### 개발 서버 실행
```bash
npm start
# 또는
expo start
```

### 플랫폼별 실행
```bash
npm run ios      # iOS 시뮬레이터
npm run android  # Android 에뮬레이터
npm run web      # 웹 브라우저
```

## 앱 설정
- **Bundle Identifier**: `com.pilyeooong.krrunningscheduleapp`
- **Orientation**: Portrait only
- **Supported Platforms**: iOS, Android
- **최소 SDK 버전**: 
  - iOS: Expo SDK 기본값
  - Android: Expo SDK 기본값

## API 데이터 형식

### MarathonEvent (원본 API)
```typescript
{
  year: number;
  month: number;
  day: number;
  day_of_week: string;
  event_name: string;
  organizer: string[];
  location: string;
  tags: string[];
  phone: string;
}
```

### RunningEvent (변환된 형식)
```typescript
{
  id: string;
  date: string;
  name: string;
  organizer: string;
  distance: string;
  location: string;
  dayOfWeek: string;
  phone: string;
}
```

## 스타일링
- 메인 테마 색상: `#2196F3` (파란색)
- 배경색: `#f5f5f5` (연한 회색)
- 카드 디자인: 그림자 효과가 있는 흰색 배경
- 폰트 크기: 
  - 제목: 24px
  - 카드 제목: 18px
  - 일반 텍스트: 14-16px

## 향후 개선 사항
- 대회 상세 정보 페이지 추가
- 즐겨찾기 기능
- 알림 설정
- 오프라인 지원
- 검색 기능
- 지도 연동