import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from 'expo-tracking-transparency';

interface AdContextType {
  canShowPersonalizedAds: boolean;
  isTrackingReady: boolean;
  isAdMobReady: boolean;
}

const AdContext = createContext<AdContextType>({
  canShowPersonalizedAds: false,
  isTrackingReady: false,
  isAdMobReady: false,
});

export const useAdContext = () => useContext(AdContext);

// AdMob 초기화는 ATT 응답 후에만 실행
let mobileAds: any;
try {
  const googleMobileAds = require('react-native-google-mobile-ads');
  mobileAds = googleMobileAds.default;
} catch (error) {
  // Expo Go 환경에서는 애드몹 사용 불가
}

interface AdProviderProps {
  children: React.ReactNode;
}

export const AdProvider: React.FC<AdProviderProps> = ({ children }) => {
  const [canShowPersonalizedAds, setCanShowPersonalizedAds] = useState(false);
  const [isTrackingReady, setIsTrackingReady] = useState(false);
  const [isAdMobReady, setIsAdMobReady] = useState(false);

  const initializeAdMob = useCallback(async () => {
    if (!mobileAds) {
      setIsAdMobReady(false);
      return;
    }
    try {
      await mobileAds().initialize();
      setIsAdMobReady(true);
    } catch (error) {
      console.error('AdMob initialization failed:', error);
      setIsAdMobReady(false);
    }
  }, []);

  useEffect(() => {
    // Android는 ATT가 필요 없음 → 바로 AdMob 초기화
    if (Platform.OS === 'android') {
      setCanShowPersonalizedAds(true);
      setIsTrackingReady(true);
      initializeAdMob();
      return;
    }

    let hasRequested = false;

    const requestTracking = async () => {
      if (hasRequested) return;
      hasRequested = true;

      try {
        // 먼저 현재 권한 상태 확인
        const { status: currentStatus } = await getTrackingPermissionsAsync();

        if (currentStatus === 'undetermined') {
          // 앱이 완전히 활성화된 후 약간의 딜레이를 두고 요청
          // Apple 권장: 앱 UI가 완전히 로드된 후 ATT 요청
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { status } = await requestTrackingPermissionsAsync();
          setCanShowPersonalizedAds(status === 'granted');
        } else {
          // 이미 결정된 경우 (granted, denied, restricted)
          setCanShowPersonalizedAds(currentStatus === 'granted');
        }
      } catch (error) {
        console.error('Tracking permission error:', error);
        setCanShowPersonalizedAds(false);
      } finally {
        setIsTrackingReady(true);
        // ATT 응답을 받은 후에만 AdMob 초기화
        initializeAdMob();
      }
    };

    // AppState가 active일 때만 ATT 요청
    // 스플래시 스크린 전환 중이면 다이얼로그가 표시되지 않을 수 있음
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && !hasRequested) {
        requestTracking();
      }
    };

    // 현재 이미 active 상태인지 확인
    if (AppState.currentState === 'active') {
      // active 상태여도 UI 렌더링이 완료될 때까지 대기
      const timer = setTimeout(() => {
        requestTracking();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // active 상태가 될 때까지 대기
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      return () => subscription.remove();
    }
  }, [initializeAdMob]);

  return (
    <AdContext.Provider value={{ canShowPersonalizedAds, isTrackingReady, isAdMobReady }}>
      {children}
    </AdContext.Provider>
  );
};
