import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useAdContext } from '../contexts/AdContext';

// Expo Go 환경에서는 애드몹 모듈을 import하지 않음
let NativeAd: any, NativeAdView: any, NativeAsset: any, NativeAssetType: any, NativeMediaView: any, TestIds: any;
try {
  const googleMobileAds = require('react-native-google-mobile-ads');
  NativeAd = googleMobileAds.NativeAd;
  NativeAdView = googleMobileAds.NativeAdView;
  NativeAsset = googleMobileAds.NativeAsset;
  NativeAssetType = googleMobileAds.NativeAssetType;
  NativeMediaView = googleMobileAds.NativeMediaView;
  TestIds = googleMobileAds.TestIds;
} catch (error) {
  // Expo Go 환경에서는 애드몹 사용 불가
}

// 실제 네이티브 광고 유닛 ID
const NATIVE_AD_UNIT_ID = 'ca-app-pub-2370970221825852/1471163912';

interface NativeAdCardProps {
  adUnitId?: string;
}

export const NativeAdCard: React.FC<NativeAdCardProps> = ({ adUnitId }) => {
  const [nativeAd, setNativeAd] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { canShowPersonalizedAds, isTrackingReady, isAdMobReady } = useAdContext();

  const unitId = adUnitId || (__DEV__ ? TestIds?.NATIVE : NATIVE_AD_UNIT_ID);

  useEffect(() => {
    if (!NativeAd || !unitId || !isTrackingReady || !isAdMobReady) {
      if (!isTrackingReady || !isAdMobReady) return;
      setIsLoading(false);
      setError(true);
      return;
    }

    let createdAd: any;
    let cancelled = false;

    const loadAd = async () => {
      try {
        setIsLoading(true);
        const ad = await NativeAd.createForAdRequest(unitId, {
          requestNonPersonalizedAdsOnly: !canShowPersonalizedAds,
        });
        // 이미 cleanup된 effect면 즉시 파기 (state 갱신 금지)
        if (cancelled) {
          ad?.destroy?.();
          return;
        }
        createdAd = ad;
        setNativeAd(ad);
        setError(false);
        if (__DEV__) console.log('Native ad loaded (personalized:', canShowPersonalizedAds, ')');
      } catch (err) {
        if (__DEV__) console.error('Native ad failed to load:', err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadAd();

    return () => {
      cancelled = true;
      createdAd?.destroy?.();
    };
  }, [unitId, isTrackingReady, isAdMobReady, canShowPersonalizedAds]);

  if (!NativeAd || error || !nativeAd) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#ccc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <Text style={styles.adLabel}>광고</Text>
      <NativeAdView nativeAd={nativeAd} style={styles.adView}>
        <View style={styles.row}>
          {nativeAd.icon && (
            <NativeAsset assetType={NativeAssetType.ICON}>
              <Image
                source={{ uri: nativeAd.icon.url }}
                style={styles.icon}
              />
            </NativeAsset>
          )}
          <View style={styles.textArea}>
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text style={styles.headline} numberOfLines={2}>
                {nativeAd.headline}
              </Text>
            </NativeAsset>
            {nativeAd.body && (
              <NativeAsset assetType={NativeAssetType.BODY}>
                <Text style={styles.body} numberOfLines={2}>
                  {nativeAd.body}
                </Text>
              </NativeAsset>
            )}
          </View>
          {nativeAd.callToAction && (
            <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>{nativeAd.callToAction}</Text>
              </View>
            </NativeAsset>
          )}
        </View>
        <NativeMediaView style={styles.media} resizeMode="cover" />
      </NativeAdView>
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F2',
  },
  adLabel: {
    fontSize: 12,
    color: '#767676',
    marginTop: 8,
    marginBottom: 4,
  },
  adView: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#F2F2F2',
  },
  textArea: {
    flex: 1,
    marginRight: 10,
  },
  headline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  body: {
    fontSize: 12,
    color: '#767676',
    marginTop: 2,
  },
  ctaButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  ctaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  media: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
});
