const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  try {
    const svgPath = path.join(__dirname, '..', 'assets', 'icon.svg');
    const iconPath = path.join(__dirname, '..', 'assets', 'icon.png');
    const adaptiveIconPath = path.join(__dirname, '..', 'assets', 'adaptive-icon.png');
    const splashIconPath = path.join(__dirname, '..', 'assets', 'splash-icon.png');
    
    // SVG 파일 읽기
    const svgBuffer = fs.readFileSync(svgPath);
    
    // 512x512 PNG로 변환 (앱 아이콘)
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(iconPath);
    
    // adaptive-icon.png (Android용)
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(adaptiveIconPath);
      
    // splash-icon.png (스플래시 스크린용)
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(splashIconPath);
    
    console.log('✅ 아이콘 변환 완료!');
    console.log('📱 icon.png: 512x512px');
    console.log('🤖 adaptive-icon.png: 512x512px');
    console.log('💦 splash-icon.png: 512x512px');
    
    // 파일 크기 확인
    const iconStats = fs.statSync(iconPath);
    console.log(`📊 아이콘 파일 크기: ${Math.round(iconStats.size / 1024)}KB`);
    
  } catch (error) {
    console.error('❌ 변환 중 오류:', error.message);
    
    // 수동으로 간단한 SVG 생성
    console.log('🔧 대체 방법으로 간단한 아이콘 생성 중...');
    
    const simpleIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2196F3"/>
  <circle cx="256" cy="180" r="40" fill="white"/>
  <path d="M200 220 L220 280 L240 260 L240 350 L270 350 L270 280 L290 300 L310 240 L280 240 L270 200 L230 210 L200 220 Z" fill="white"/>
  <text x="256" y="420" font-family="Arial" font-size="36" font-weight="bold" text-anchor="middle" fill="white">러닝대회</text>
</svg>`;
    
    fs.writeFileSync(path.join(__dirname, '..', 'assets', 'simple-icon.svg'), simpleIcon);
    console.log('📝 simple-icon.svg 생성됨');
    console.log('🌐 온라인 변환기 사용: https://cloudconvert.com/svg-to-png');
  }
}

convertSvgToPng();