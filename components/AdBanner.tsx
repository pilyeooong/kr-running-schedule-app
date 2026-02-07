import React, { useEffect, useState } from 'react';
import { View, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdContext } from '../contexts/AdContext';

// Expo Go 환경에서는 애드몹 모듈을 import하지 않음
let mobileAds: any, BannerAd: any, BannerAdSize: any, TestIds: any;
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
  ? TestIds?.BANNER
  : Platform.select({
      ios: 'ca-app-pub-2370970221825852/1956681472',
      android: 'ca-app-pub-2370970221825852/8003215077',
    }) || TestIds?.BANNER;

export const AdBanner: React.FC = () => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { canShowPersonalizedAds, isTrackingReady } = useAdContext();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const initializeAdMob = async () => {
      try {
        await mobileAds().initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('AdMob initialization failed:', error);
        setIsInitialized(false);
      }
    };

    if (mobileAds) {
      initializeAdMob();
    } else {
      setIsInitialized(false);
    }
  }, []);

  // AdMob 또는 ATT가 준비되지 않았으면 로딩 표시
  if (!isInitialized || !isTrackingReady) {
    return (
      <View style={{ alignItems: 'center', height: 50, backgroundColor: '#f5f5f5', justifyContent: 'center' }}>
        <Text style={{ color: '#999' }}>광고 로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center', backgroundColor: '#f5f5f5', minHeight: 60, justifyContent: 'center', paddingBottom: insets.bottom }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: !canShowPersonalizedAds,
        }}
        onAdLoaded={() => {
          console.log('Ad loaded successfully (personalized:', canShowPersonalizedAds, ')');
          setIsAdLoaded(true);
        }}
        onAdFailedToLoad={(error: Error) => {
          console.error('Ad failed to load:', error);
        }}
      />
    </View>
  );
};