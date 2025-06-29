# 한국 러닝 대회 일정 앱

한국의 마라톤 및 러닝 대회 일정을 확인할 수 있는 React Native 앱입니다.

## 기능

- **월별 대회 조회**: 월별로 필터링하여 러닝 대회를 확인할 수 있습니다
- **대회 상세 정보**: 대회명, 일정, 장소, 거리 정보 제공
- **자동 스크롤**: 현재 날짜와 가장 가까운 대회로 자동 스크롤
- **실시간 데이터**: 마라톤 API를 통한 최신 대회 정보

## 기술 스택

- **React Native**: 0.79.4
- **Expo**: ~53.0.13
- **TypeScript**: ~5.8.3
- **React**: 19.0.0

## 설치 및 실행

### 필수 조건

- Node.js (v18 이상)
- npm 또는 yarn
- Expo CLI

### 설치

```bash
# 저장소 클론
git clone https://github.com/pilyeooong/kr-running-schedule-app.git
cd kr-running-schedule-app

# 의존성 설치
npm install
```

### 실행

```bash
# 개발 서버 시작
npm start

# Android에서 실행
npm run android

# iOS에서 실행 (macOS 전용)
npm run ios

# 웹에서 실행
npm run web
```

## 프로젝트 구조

```
├── components/          # 재사용 가능한 컴포넌트
│   ├── EventCard.tsx   # 대회 카드 컴포넌트
│   └── MonthFilter.tsx # 월별 필터 컴포넌트
├── data/               # 정적 데이터
│   └── events.ts       # 대회 데이터
├── services/           # API 서비스
│   └── marathonApi.ts  # 마라톤 API 통신
├── types/              # TypeScript 타입 정의
│   └── index.ts        # 공통 타입
├── App.tsx             # 메인 애플리케이션
└── package.json        # 프로젝트 설정
```

## 주요 컴포넌트

### EventCard
개별 러닝 대회 정보를 표시하는 카드 컴포넌트입니다.

### MonthFilter
월별로 대회를 필터링할 수 있는 컴포넌트입니다.

### marathonApi
외부 마라톤 API에서 데이터를 가져와 앱 형식으로 변환하는 서비스입니다.

## 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경 사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.