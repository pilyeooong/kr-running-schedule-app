import React from 'react';
import { View, Platform, Text } from 'react-native';
import { useAdContext } from '../contexts/AdContext';

// Expo Go 환경에서는 애드몹 모듈을 import하지 않음
let BannerAd: any, BannerAdSize: any, TestIds: any;
try {
  const googleMobileAds = require('react-native-google-mobile-ads');
  BannerAd = googleMobileAds.BannerAd;
  BannerAdSize = googleMobileAds.BannerAdSize;
  TestIds = googleMobileAds.TestIds;
} catch (error) {
  // Expo Go 환경에서는 애드몹 사용 불가
}

const adUnitId = __DEV__
  ? TestIds?.BANNER
  : Platform.select({
      ios: 'ca-app-pub-2370970221825852/1956681472',
      android: 'ca-app-pub-2370970221825852/8003215077',
    }) || TestIds?.BANNER;

export const AdBanner: React.FC = () => {
  const { canShowPersonalizedAds, isTrackingReady, isAdMobReady } = useAdContext();
  // ATT 응답 + AdMob 초기화 완료 전까지 로딩 표시
  if (!isTrackingReady || !isAdMobReady) {
    return (
      <View style={{ alignItems: 'center', height: 50, backgroundColor: '#FFFFFF', justifyContent: 'center' }}>
        <Text style={{ color: '#767676' }}>광고 로딩 중...</Text>
      </View>
    );
  }

  if (!BannerAd) {
    return null;
  }

  return (
    <View style={{ alignItems: 'center', backgroundColor: '#FFFFFF', minHeight: 50, justifyContent: 'center' }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: !canShowPersonalizedAds,
        }}
        onAdLoaded={() => {
          if (__DEV__) console.log('Ad loaded successfully (personalized:', canShowPersonalizedAds, ')');
        }}
        onAdFailedToLoad={(error: Error) => {
          if (__DEV__) console.error('Ad failed to load:', error);
        }}
      />
    </View>
  );
};