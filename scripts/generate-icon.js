const fs = require('fs');
const path = require('path');

// SVG 아이콘 생성 (512x512)
const svgContent = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- 배경 -->
  <rect width="512" height="512" rx="102" fill="#2196F3"/>
  
  <!-- 달리는 사람 아이콘 (흰색) -->
  <g transform="translate(256, 256) scale(12, 12) translate(-12, -12)">
    <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" 
          fill="white"/>
  </g>
  
  <!-- 하단 텍스트 -->
  <text x="256" y="420" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">
    러닝 대회
  </text>
</svg>
`;

// SVG 파일 저장
const assetsDir = path.join(__dirname, '..', 'assets');
const svgPath = path.join(assetsDir, 'icon.svg');

fs.writeFileSync(svgPath, svgContent);

console.log('SVG 아이콘이 생성되었습니다.');
console.log('다음 단계:');
console.log('1. https://cloudconvert.com/svg-to-png 에서 SVG를 PNG로 변환');
console.log('2. 512x512px PNG로 변환 후 assets/icon.png 에 저장');
console.log('3. adaptive-icon.png도 동일하게 교체');
console.log('\n또는 expo-cli를 사용하여 자동 생성:');
console.log('npx expo-optimize');