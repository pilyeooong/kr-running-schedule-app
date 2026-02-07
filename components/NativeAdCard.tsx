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
  const { canShowPersonalizedAds, isTrackingReady } = useAdContext();

  const unitId = adUnitId || (__DEV__ ? TestIds?.NATIVE : NATIVE_AD_UNIT_ID);

  useEffect(() => {
    if (!NativeAd || !unitId || !isTrackingReady) {
      if (!isTrackingReady) return;
      setIsLoading(false);
      setError(true);
      return;
    }

    const loadAd = async () => {
      try {
        setIsLoading(true);
        const ad = await NativeAd.createForAdRequest(unitId, {
          requestNonPersonalizedAdsOnly: !canShowPersonalizedAds,
        });
        setNativeAd(ad);
        setError(false);
        console.log('Native ad loaded (personalized:', canShowPersonalizedAds, ')');
      } catch (err) {
        console.error('Native ad failed to load:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadAd();

    return () => {
      if (nativeAd?.destroy) {
        nativeAd.destroy();
      }
    };
  }, [unitId, isTrackingReady, canShowPersonalizedAds]);

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
    backgroundColor: '#e0e0e0',
  },
  adLabel: {
    fontSize: 10,
    color: '#999',
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
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  textArea: {
    flex: 1,
    marginRight: 10,
  },
  headline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  body: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  ctaButton: {
    backgroundColor: '#2196F3',
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
    borderRadius: 8,
    marginBottom: 8,
  },
});
