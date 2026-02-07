import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from 'expo-tracking-transparency';

interface AdContextType {
  canShowPersonalizedAds: boolean;
  isTrackingReady: boolean;
}

const AdContext = createContext<AdContextType>({
  canShowPersonalizedAds: false,
  isTrackingReady: false,
});

export const useAdContext = () => useContext(AdContext);

interface AdProviderProps {
  children: React.ReactNode;
}

export const AdProvider: React.FC<AdProviderProps> = ({ children }) => {
  const [canShowPersonalizedAds, setCanShowPersonalizedAds] = useState(false);
  const [isTrackingReady, setIsTrackingReady] = useState(false);

  useEffect(() => {
    const requestTracking = async () => {
      // Android는 ATT가 필요 없음
      if (Platform.OS === 'android') {
        setCanShowPersonalizedAds(true);
        setIsTrackingReady(true);
        return;
      }

      try {
        // 먼저 현재 권한 상태 확인
        const { status: currentStatus } = await getTrackingPermissionsAsync();

        if (currentStatus === 'undetermined') {
          // 아직 요청하지 않은 경우 권한 요청
          const { status } = await requestTrackingPermissionsAsync();
          setCanShowPersonalizedAds(status === 'granted');
        } else {
          // 이미 결정된 경우
          setCanShowPersonalizedAds(currentStatus === 'granted');
        }
      } catch (error) {
        console.error('Tracking permission error:', error);
        setCanShowPersonalizedAds(false);
      } finally {
        setIsTrackingReady(true);
      }
    };

    requestTracking();
  }, []);

  return (
    <AdContext.Provider value={{ canShowPersonalizedAds, isTrackingReady }}>
      {children}
    </AdContext.Provider>
  );
};
