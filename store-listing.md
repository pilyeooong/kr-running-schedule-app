# Play Store 업로드 체크리스트

## ✅ 완료된 항목

### 1. 앱 설정 (app.json)
- [x] 앱 이름 한글로 변경: "한국 러닝 대회 일정"
- [x] 버전: 1.0.0
- [x] 버전 코드: 1
- [x] Android 패키지명: com.pilyeooong.krrunningscheduleapp
- [x] iOS 번들 ID: com.pilyeooong.krrunningscheduleapp
- [x] 화면 방향: 세로 모드만
- [x] 스플래시 스크린 배경색: #2196F3 (앱 테마 색상)
- [x] Android 권한: 빈 배열 (특별한 권한 불필요)

### 2. 개인정보 처리방침
- [x] 한국어 버전 (privacy-policy.html)
- [x] 영어 버전 (privacy-policy-en.html)
- [x] 개인정보 미수집 명시

### 3. Play Store 메타데이터
- [x] 앱 이름
- [x] 짧은 설명 (80자 이내)
- [x] 상세 설명 (주요 기능, 대상 사용자, 특징 포함)
- [x] 카테고리: 건강 및 피트니스
- [x] 콘텐츠 등급: 전체 이용가

## 📋 준비해야 할 항목

### 1. 스크린샷 (최소 2개, 최대 8개)
추천 스크린샷:
1. 메인 화면 (이번 달 대회 목록)
2. 월 필터 선택 화면
3. 대회 상세 정보 카드
4. 로딩 화면

요구사항:
- 크기: 320px-3840px (권장: 1080x1920 또는 1242x2208)
- 형식: PNG 또는 JPG
- 실제 앱 화면 캡처

### 2. 앱 아이콘
- [x] 512x512px PNG (이미 assets/icon.png에 있음)
- 배경 투명 불가
- 모서리 둥글게 처리하지 않음 (Google Play가 자동 처리)

### 3. 그래픽 이미지 (선택사항)
- 1024x500px 배너 이미지
- 앱을 대표하는 그래픽

### 4. 개인정보 처리방침 URL
GitHub Pages나 다른 호스팅 서비스에 privacy-policy.html 업로드 필요

## 🚀 EAS Build 명령어

### 1. EAS CLI 설치 (이미 설치되어 있지 않은 경우)
```bash
npm install -g eas-cli
```

### 2. EAS 로그인
```bash
eas login
```

### 3. 프로덕션 빌드 생성
```bash
# Android AAB (App Bundle) 생성
eas build --platform android --profile production

# APK 생성 (테스트용)
eas build --platform android --profile preview
```

### 4. 빌드 상태 확인
```bash
eas build:list
```

## 📱 Play Console 업로드 단계

1. [Google Play Console](https://play.google.com/console) 접속
2. 새 앱 만들기
3. 앱 정보 입력:
   - 앱 이름: 한국 러닝 대회 일정
   - 기본 언어: 한국어
   - 앱/게임: 앱
   - 무료/유료: 무료

4. 앱 설정:
   - 앱 액세스 권한: 모든 기능 제한 없이 액세스 가능
   - 광고 포함 여부: 아니요
   - 콘텐츠 등급: 설문조사 완료 (전체 이용가)
   - 타겟 연령층: 모든 연령
   - 뉴스 앱 여부: 아니요

5. 스토어 등록정보:
   - 앱 설명 복사/붙여넣기
   - 스크린샷 업로드
   - 아이콘 업로드
   - 개인정보처리방침 URL 입력

6. 프로덕션 출시:
   - AAB 파일 업로드
   - 출시 노트 작성
   - 검토 및 출시

## 🔍 출시 전 체크리스트

- [ ] 앱 테스트 (다양한 기기에서)
- [ ] 네트워크 오류 처리 확인
- [ ] 로딩 상태 확인
- [ ] 월별 필터링 기능 확인
- [ ] 자동 스크롤 기능 확인
- [ ] 개인정보처리방침 URL 활성화
- [ ] 스크린샷 준비
- [ ] AAB 파일 생성
- [ ] 서명된 빌드 확인