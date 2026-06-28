# 러닝 캘린더 (kr-running-schedule-app) 스펙

> 본 문서는 실제 소스 코드와 설정 파일을 근거로 작성되었다. 일부 문서(`CLAUDE.md`, `README.md`)는 과거 버전(Expo SDK 53 / RN 0.79) 기준으로 작성되어 있으나, **실제 `package.json` / `app.json` 기준은 아래 본문이 정확하다.**

## 개요

- **앱 이름**: 러닝 캘린더 (App Store 표시명 `러닝 캘린더`, slug `kr-running-schedule-app`)
- **목적**: 한국의 마라톤 / 러닝 대회 일정을 조회하고, 연·월·지역·거리·접수상태로 필터링하며, 접수중 / 접수 임박 대회를 한눈에 보여주는 모바일 앱.
- **플랫폼**: iOS · Android (React Native + Expo). `app.json`에서 `orientation: portrait`, `userInterfaceStyle: light`, iOS `supportsTablet: false`(아이폰 전용), New Architecture(`newArchEnabled: true`) 활성.
- **데이터**: 자체 호스팅된 GitHub raw JSON에서 대회 데이터를 실시간 fetch (로컬 정적 데이터 없음). 백엔드 서버 없이 정적 JSON 단일 소스로 동작.
- **수익화**: Google AdMob (배너 + 네이티브 광고), iOS는 ATT(App Tracking Transparency) 연동.
- **현재 버전**: `1.8.0` (iOS buildNumber `47`, Android versionCode `15`).

## 기술 스택

`package.json` 기준 실제 의존성 버전:

| 항목 | 버전 |
|------|------|
| Expo | `^55.0.6` |
| React Native | `^0.83.2` |
| React | `^19.2.0` |
| TypeScript | `~5.9.2` (devDependency) |
| expo-status-bar | `~55.0.4` |
| expo-dev-client | `~55.0.16` |
| expo-tracking-transparency | `~55.0.8` (iOS ATT) |
| react-native-google-mobile-ads | `^15.4.0` (AdMob) |
| react-native-safe-area-context | `~5.6.2` |
| react-native-svg | `^15.15.3` |
| @expo/vector-icons | `^15.1.1` (Ionicons) |
| @babel/core | `^7.25.2` (dev) |
| @types/react | `~19.2.10` (dev) |

- 진입점: `index.ts` → `registerRootComponent(App)` (메인 컴포넌트 `App.tsx`).
- `tsconfig.json`은 `expo/tsconfig.base`를 확장.
- `metro.config.js`는 `react-native-google-mobile-ads`를 `extraNodeModules`로 명시 resolve(모노레포/심볼릭 환경 대응).
- 상태 관리: React 내장 훅(`useState`/`useMemo`/`useRef`/`useEffect`/`useCallback`) + Context API(`AdContext`). Redux 등 외부 상태 라이브러리 없음.
- 네비게이션: 외부 navigation 라이브러리 없이 `activeTab` 상태 + `Modal` 기반 자체 화면 전환.

## 주요 기능

### 1. 대회 일정 조회 (홈 탭 `home`)
- 외부 JSON API에서 전체 대회 로드 후, **연도 + 월** 단위로 필터링하여 `FlatList`로 표시.
- 데이터에 존재하는 연도/월만 필터로 노출(`availableYears`, `availableMonths`). 초기 진입 시 현재 연/월(없으면 가장 가까운 연/월) 자동 선택.
- 좌우 스와이프(PanResponder)로 이전/다음 월 이동, 월 경계에서는 인접 연도로 넘어감. 진입 후 3초간 스와이프 힌트 노출.
- 스크롤 다운 시 필터 헤더가 접히고(collapse), 스크롤 업 시 펼쳐지는 애니메이션(`Animated`).
- 로딩 중 스켈레톤 카드(펄스 애니메이션) 표시, 에러 시 "다시 시도" 버튼.
- 초기 로드 후 오늘과 가장 가까운 대회로 자동 스크롤(`scrollToNearestEvent`, `scrollToIndex` 실패 시 근사 오프셋 폴백).

### 2. 다중 필터
- **연도 필터**(`YearFilter`), **월 필터**(`MonthFilter`): 연도별로 마지막 선택 월을 기억(`monthByYear`).
- **접수 상태 필터**(`StatusFilter`): `접수중(open)` / `접수마감(closed)` (필터 UI에는 `upcoming`/`unknown` 제외).
- **거리 필터**(`DistanceFilter`): 풀코스 / 하프 / 10K / 5K / 울트라 / 트레일. 한 대회가 복수 카테고리에 속할 수 있음(정규식 기반 분류).
- **지역 필터**(`RegionFilter`): 17개 시·도 + 기타. 표준 지역 순서(`REGION_ORDER`)로 정렬.
- 각 필터는 현재 연/월 기준 카운트를 함께 표시. 적용된 필터는 칩으로 노출되며 개별 해제 가능, 결과 없을 때 "필터 초기화" 제공.

### 3. 접수 현황 탭 (`upcoming`, `UpcomingScreen`)
- **접수중**: 현재 접수 기간인 대회를 접수 마감일순 정렬, D-Day 뱃지(`D-n`, 7일 이내 긴급 색상) + 마감일 표시.
- **접수 곧 시작**: 향후 30일(`DAYS_AHEAD = 30`) 이내 접수가 시작되는 대회를 시작일순 정렬, `D-n` + 접수 시작일 표시.
- 거리/지역 세그먼트 내 필터 지원. 하단 탭 뱃지에 (접수중 + 30일 이내 시작) 합산 개수 노출.

### 4. 검색 (`SearchModal`)
- 대회명·지역·장소·상세장소·주최·거리·설명을 대상으로 공백 구분 토큰 **AND 부분일치** 검색(`utils/search.ts`).
- 옵션: "지난 대회 포함" 토글(기본 제외), 정렬 드롭다운(가까운 날짜순 / 먼 날짜순).

### 5. 대회 상세 (`EventDetailModal`)
- pageSheet 모달. 날짜/요일/출발시간/코스, 장소(+상세/주소), 지역, 대회 소개, 접수 기간, 주최·대표·전화·이메일, 홈페이지 표시.
- 액션: 지도 보기(좌표 있으면 `maps.apple.com?ll=`, 없으면 주소 쿼리), 전화(`tel:`), 이메일(`mailto:`), 홈페이지(`Linking.openURL`).

### 6. 강제 업데이트 (`ForceUpdateModal` + `utils/versionCheck.ts`)
- 앱 시작 시 별도 JSON(`app-config/version-check.json`)을 fetch하여 `forceUpdate && 현재버전 < minVersion`이면 차단형 업데이트 모달 표시. 플랫폼별 스토어 URL로 이동. 체크 실패 시 앱 사용 비차단.

### 7. 광고 (AdMob)
- **하단 배너**(`AdBanner`): ANCHORED_ADAPTIVE_BANNER, 화면 하단 고정.
- **네이티브 광고 카드**(`NativeAdCard`): 리스트 내 7개 항목마다 1개 삽입(`utils/listItems.ts`, `AD_INTERVAL = 7`, id 결정적 생성으로 리렌더 안정).
- `__DEV__`에서는 Google 테스트 광고 ID 사용, 프로덕션에서는 실 광고 단위 ID 사용. Expo Go 환경 대비 `require`를 try/catch로 감싸 모듈 부재 시 graceful 처리.
- iOS: ATT 권한 응답 이후에만 AdMob 초기화 및 광고 요청(비허용 시 `requestNonPersonalizedAdsOnly`). Android: ATT 불필요, 즉시 초기화.

## 아키텍처 / 구현

### 디렉터리 구조
```
kr-running-schedule-app/
├── App.tsx                  # 메인 컴포넌트(상태/필터/스와이프/리스트 조립)
├── index.ts                 # registerRootComponent 진입점
├── app.json                 # Expo 설정(이름/버전/iOS/Android/플러그인)
├── eas.json                 # EAS Build 프로파일(아래 빌드 섹션 참고)
├── metro.config.js          # Metro: AdMob 모듈 resolve
├── components/              # UI 컴포넌트
│   ├── EventCard.tsx         # 대회 카드(날짜박스 + 정보 + 상태/지역 뱃지)
│   ├── EventDetailModal.tsx  # 상세 모달
│   ├── SearchModal.tsx       # 검색 모달
│   ├── UpcomingScreen.tsx    # 접수현황 탭 화면
│   ├── BottomTabBar.tsx      # 하단 탭(일정/접수현황 + 뱃지)
│   ├── AppBanner.tsx         # 상단 타이틀 + 검색 버튼
│   ├── ForceUpdateModal.tsx  # 강제 업데이트 모달
│   ├── AdBanner.tsx / NativeAdCard.tsx  # AdMob 배너/네이티브
│   ├── YearFilter / MonthFilter / StatusFilter / DistanceFilter / RegionFilter / Dropdown
├── contexts/
│   └── AdContext.tsx        # ATT + AdMob 초기화 상태 Provider
├── services/
│   └── marathonApi.ts       # 외부 API fetch + 데이터 변환
├── types/
│   └── index.ts             # MarathonEvent / RunningEvent / ListItem 타입
├── utils/
│   ├── registrationStatus.ts # 접수기간 파싱 + 상태/라벨/색상
│   ├── distanceCategory.ts   # 거리 문자열 → 카테고리 분류(정규식)
│   ├── regions.ts            # 지역 표준 순서 정렬
│   ├── search.ts             # 토큰 AND 검색
│   ├── listItems.ts          # 이벤트 리스트에 광고 삽입
│   └── versionCheck.ts       # 강제 업데이트 버전 비교
├── assets/                  # 아이콘/스플래시/스토어 이미지
├── ios/ · android/          # prebuild된 네이티브 프로젝트
├── fastlane/                # App Store 메타데이터/스크린샷
└── scripts/                 # 아이콘 생성 스크립트(generate-icon.js, convert-icon.js)
```

### 데이터 흐름
1. `App.tsx` 마운트 → `loadMarathonEvents()` 호출 → `services/marathonApi.ts`의 `fetchMarathonEvents()`가 외부 JSON GET.
2. 원본 `MarathonEvent[]`를 `transformMarathonToRunningEvent()`로 `RunningEvent[]`로 변환. 변환 시 빈 문자열/":"/null을 `undefined`로 정규화(`safeStr`/`safeNum`), `date`를 `YYYY-MM-DD`로 패딩, `tags`를 ` / ` 조인하여 `distance`로 구성.
3. `allEvents` 상태에 저장 → `useMemo`로 연/월/상태/거리/지역 필터링 및 카운트 파생 → 광고 삽입(`insertAds`) → `FlatList` 렌더.
4. 접수 상태는 `registrationPeriod`(예: `2024년10월10일~2025년1월10일`)를 정규식 파싱하여 오늘과 비교(open/upcoming/closed/unknown).

### 외부 데이터 소스 (별도 GitHub 저장소 `pilyeooong/kr-marathon-schedule`)
- **대회 데이터**: `https://raw.githubusercontent.com/pilyeooong/kr-marathon-schedule/refs/heads/master/marathon_data/latest-marathon-schedule.json`
- **버전 체크**: `https://raw.githubusercontent.com/pilyeooong/kr-marathon-schedule/refs/heads/master/app-config/version-check.json`
- 둘 다 무인증 public raw URL. 앱은 읽기 전용 소비자이며, 데이터 갱신 파이프라인은 이 앱 저장소 밖에 있음.

### 핵심 데이터 타입
- `MarathonEvent`(원본): `year(number|string)`, `month`, `day`, `day_of_week`, `event_name`, `tags[]`, `location`, `organizer[]`, `phone` + 선택: `homepage`, `email`, `representative`, `start_time`, `region`, `registration_period`, `venue_detail`, `description`, `latitude`, `longitude`, `map_address`.
- `RunningEvent`(앱 내부): 위를 camelCase로 변환한 정규화 형태 + `id`.
- `ListItem`: `{type:'event', data}` 또는 `{type:'ad', id}` 유니온.

## 빌드 · 실행 · 배포

### 개발 실행 (`package.json` scripts)
```bash
npm start          # expo start (Metro)
npm run ios        # expo run:ios (네이티브 빌드)
npm run android    # expo run:android
npm run web        # expo start --web
```

### iOS 네이티브 설정
- Bundle ID: `com.pilyeooong.krrunningscheduleapp`, 표시명 `러닝 캘린더`, `LSMinimumSystemVersion 12.0`.
- `ITSAppUsesNonExemptEncryption: false`(수출규정 면제), `NSUserTrackingUsageDescription`(ATT 설명), `NSAllowsLocalNetworking`(개발 서버).
- URL scheme: `com.pilyeooong.krrunningscheduleapp`, `exp+kr-running-schedule-app`.
- 스플래시: `SplashScreen` 스토리보드, New Architecture(`RCTNewArchEnabled`).

### Android 네이티브 설정
- package `com.pilyeooong.krrunningscheduleapp`, versionCode `15`.
- 권한: INTERNET, READ/WRITE_EXTERNAL_STORAGE, SYSTEM_ALERT_WINDOW, VIBRATE, `com.google.android.gms.permission.AD_ID`.
- AdMob App ID 메타데이터 주입(`ca-app-pub-2370970221825852~8890573725`).
- **서명 주의**: `android/app/build.gradle`에서 `release` 빌드 타입이 `signingConfig signingConfigs.debug`(디버그 키스토어)로 설정되어 있음 — 별도 릴리스 키스토어가 구성돼 있지 않다. 저장소 루트에 `kr-running-schedule-app.aab`(약 19MB) 산출물이 커밋되어 있으나, 정식 스토어 배포용 release 서명 구성은 현재 코드에 없음.

### 빌드 방식 (모노레포 정책)
- 모노레포 루트 `CLAUDE.md` 정책상 **EAS Build 미사용, iOS는 Xcode 로컬 빌드** 진행이 원칙이다. (`eas.json`이 존재하나 정책상 보조/레거시.)
- `eas.json` 내용: production iOS 이미지 `macos-sequoia-15.6-xcode-26.2`, Android `app-bundle`, `autoIncrement` 활성. submit production iOS는 `appleId: pilyeooong@gmail.com`, `ascAppId: 6751476692`.

### App Store 배포 (fastlane)
- `fastlane/Fastfile`은 모노레포 공용 `../../asc/Fastfile`을 import하는 한 줄. `Appfile`에 app_identifier / apple_id / team_id(`L97Y6P77C6`) 정의.
- 메타데이터 로케일: `ko`, `en-US`. 스크린샷은 `fastlane/screenshots/ko/`에 존재(6.5인치).
- 심사 정보(`review_information/`), 카테고리(`primary_category.txt` 등) 포함. 공용 lane(`create_app`, `sync_metadata`, `configure_release_defaults` 등)은 루트 `asc/`에 정의.
- `app-ads.txt`: `google.com, pub-2370970221825852, DIRECT, f08c47fec0942fa0` (AdMob 퍼블리셔 인증).

## 환경변수 · 시크릿 요구사항

- **`.env` 류 환경변수 파일 없음.** 앱은 런타임 환경변수를 사용하지 않으며, API URL·AdMob ID 등은 모두 소스/설정에 하드코딩되어 있다(공개되어도 무방한 값들 — AdMob 단위 ID, public raw GitHub URL).
- **AdMob 식별자(공개 가능, 시크릿 아님)**:
  - iOS App ID `ca-app-pub-2370970221825852~4999430174`, Android App ID `ca-app-pub-2370970221825852~8890573725`
  - iOS 배너 `…/1956681472`, Android 배너 `…/8003215077`, 네이티브 `…/1471163912`
- **App Store Connect 인증(이 저장소 밖, 모노레포 `asc/`에 위치)**: fastlane 실행에는 `asc/keys/AuthKey_338L943K3M.p8`(API Key, gitignored)와 `asc/.env`(`ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_PRIVATE_KEY_PATH`)가 필요. 이 앱 디렉터리 내에는 존재하지 않음.
- **iOS 코드사이닝**: 분산용 인증서/프로비저닝 프로파일(`.p12`/`.mobileprovision`)은 저장소에 없으며 Xcode/Apple 계정 측에서 관리.
- **Android 릴리스 키스토어(`.jks`/release `keystore`): 저장소에 없음.** 현재 release가 디버그 키스토어로 서명되도록 되어 있어, 정식 배포 시 별도 릴리스 키스토어 구성이 필요(미존재).
- **`google-services.json` / `GoogleService-Info.plist`: 사용하지 않음(저장소에 없음).** AdMob은 `react-native-google-mobile-ads` 플러그인이 네이티브 설정에 ID를 직접 주입.

### gitignore된 / 로컬 전용 파일 점검 결과 (이 디렉터리 한정)
- `ios/.xcode.env.local` — **untracked + gitignored**. 내용은 머신 종속 `NODE_BINARY` 경로뿐(시크릿 아님, 복구 가능). 빌드 환경 의존성.
- `android/app/debug.keystore` — git에 **추적됨**(표준 Expo 디버그 키스토어, 릴리스 시크릿 아님).
- 검색한 민감 패턴(`.env`, `*.jks`, `*.p8`, `*.p12`, `*.key`, `*.mobileprovision`, release `keystore`, `google-services.json`, `GoogleService-Info.plist`) 중 이 디렉터리에 존재하는 복구불가 시크릿: **없음.**

## CLAUDE.md 요약

`CLAUDE.md`(앱 자체 문서)는 앱을 "한국 마라톤/러닝 대회 일정을 외부 API에서 실시간 fetch해 월별 필터링으로 보여주는 React Native 앱"으로 정의하고, 디렉터리 구조·데이터 흐름·컴포넌트(App/EventCard/MonthFilter/marathonApi)·빌드 명령·API 데이터 형식·스타일 가이드(메인 색 `#2196F3`)를 기술한다.

**주의**: 이 `CLAUDE.md`는 초기 버전(Expo SDK 53, RN 0.79.4, React 19.0.0, 단순 월별 필터만 존재) 기준으로 작성되어 **현재 실제 구현보다 뒤처져 있다.** 실제 앱은 그 이후로 ① Expo SDK 55 / RN 0.83 / React 19.2로 업그레이드, ② 연/지역/거리/접수상태 다중 필터, ③ 접수현황 탭, ④ 검색, ⑤ 상세 모달, ⑥ AdMob(배너+네이티브)+ATT, ⑦ 강제 업데이트, ⑧ 좌우 스와이프·접히는 필터 등으로 대폭 확장되었다. 메인 컬러도 코드상 실제로는 포인트 색 `#FF5733`(주황) 중심이다. 따라서 본 SPEC 본문이 현행 기준이며 `CLAUDE.md`는 역사적 참고로 둔다.

추가로 **모노레포 루트 `CLAUDE.md`**가 상위 정책을 규정한다: Expo SDK 55 고정, EAS 미사용·Xcode 로컬 빌드, AdMob 수익화, 아이콘은 `@expo/vector-icons`(이모지 금지), `supportsTablet:false`·`ITSAppUsesNonExemptEncryption:false`, bundleId 소문자 규칙, fastlane 공용(`asc/`) 기반 App Store Connect 자동화, headless 시뮬레이터 운용·멀티세션 포트 충돌 방지 등. 이 앱은 해당 모노레포의 참조(Best) 프로젝트로 지정되어 있다.
