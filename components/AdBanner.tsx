import React, { useEffect, useState } from 'react';
import { View, Platform, Text } from 'react-native';

// Expo Go 환경에서는 애드몹 모듈을 import하지 않음
let mobileAds, BannerAd, BannerAdSize, TestIds;
try {
  const googleMobileAds = require('react-native-google-mobile-ads');
  mobileAds = googleMobileAds.default;
  BannerAd = googleMobileAds.BannerAd;
  BannerAdSize = googleMobileAds.BannerAdSize;
  TestIds = googleMobileAds.TestIds;
} catch (error) {
  // Expo Go 환경에서는 애드몹 사용 불가
}

const adUnitId = __DEV__ 
  ? TestIds.BANNER 
  : Platform.select({
      ios: 'ca-app-pub-2370970221825852/1956681472',
      android: 'ca-app-pub-2370970221825852/8003215077',
    }) || TestIds.BANNER;

export const AdBanner: React.FC = () => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAdMob = async () => {
      try {
        await mobileAds().initialize();
        console.log('AdMob initialized successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('AdMob initialization failed:', error);
        setIsInitialized(false);
      }
    };

    initializeAdMob();
  }, []);

  // AdMob이 초기화되지 않았으면 로딩 표시
  if (!isInitialized) {
    return (
      <View style={{ alignItems: 'center', marginVertical: 10, height: 50, backgroundColor: '#f0f0f0', justifyContent: 'center' }}>
        <Text style={{ color: '#666' }}>AdMob 초기화 중...</Text>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center', marginVertical: 10, backgroundColor: '#e3f2fd', minHeight: 60, justifyContent: 'center' }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => {
          console.log('Ad loaded successfully');
          setIsAdLoaded(true);
        }}
        onAdFailedToLoad={(error) => {
          console.error('Ad failed to load:', error);
        }}
      />
    </View>
  );
};