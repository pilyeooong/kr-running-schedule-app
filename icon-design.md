# 앱 아이콘 디자인 가이드

## 현재 상황
- 기존 아이콘: assets/icon.png (22KB)
- 새 디자인 필요: 달리는 사람 모양

## 아이콘 요구사항
- **크기**: 512x512px (Play Store용)
- **형식**: PNG (32비트)
- **배경**: 투명하지 않아야 함
- **디자인**: 달리는 사람 + 앱 테마

## 디자인 컨셉
```
┌─────────────────┐
│                 │
│   🏃‍♂️ 달리는 사람    │
│                 │
│   "러닝 대회"      │
│                 │
└─────────────────┘
```

## 색상 팔레트
- **배경**: #2196F3 (앱 테마 파란색)
- **아이콘**: #FFFFFF (흰색)
- **텍스트**: #FFFFFF (흰색)

## SVG 코드
생성된 SVG 파일: assets/icon.svg

## PNG 변환 방법
1. **온라인 도구 사용**:
   - https://cloudconvert.com/svg-to-png
   - https://svgtopng.com/
   - https://convertio.co/svg-png/

2. **로컬 도구 사용**:
   - Sketch, Figma, Adobe Illustrator
   - Inkscape (무료)

3. **CLI 도구**:
   ```bash
   # ImageMagick 사용 (설치 필요)
   convert icon.svg -resize 512x512 icon.png
   
   # rsvg-convert 사용
   rsvg-convert -h 512 -w 512 icon.svg > icon.png
   ```

## 적응형 아이콘 (Android)
- adaptive-icon.png도 동일한 디자인으로 교체
- Android에서 자동으로 모서리를 둥글게 처리

## 테스트
아이콘 교체 후:
1. `expo start` 실행
2. 시뮬레이터/에뮬레이터에서 확인
3. 바탕화면 아이콘 확인