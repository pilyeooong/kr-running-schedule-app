import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface RegionFilterProps {
  selectedRegion: string | null;
  onRegionSelect: (region: string | null) => void;
  availableRegions: string[];
  regionCounts: Record<string, number>;
  totalCount: number;
}

const BUTTON_MIN_WIDTH = 52;

export const RegionFilter: React.FC<RegionFilterProps> = ({
  selectedRegion,
  onRegionSelect,
  availableRegions,
  regionCounts,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const buttonPositions = useRef<Record<string, number>>({});

  const scrollToSelected = useCallback(() => {
    if (!scrollViewRef.current || selectedRegion === null) return;
    const position = buttonPositions.current[selectedRegion];
    if (position !== undefined) {
      scrollViewRef.current.scrollTo({ x: Math.max(0, position - 20), animated: true });
    }
  }, [selectedRegion]);

  useEffect(() => {
    setTimeout(scrollToSelected, 100);
  }, [scrollToSelected]);

  let accumulatedX = 0;
  const regionPositions: Record<string, number> = {};
  availableRegions.forEach((region) => {
    regionPositions[region] = accumulatedX;
    accumulatedX += BUTTON_MIN_WIDTH + 8;
  });
  buttonPositions.current = regionPositions;

  const handlePress = (region: string) => {
    onRegionSelect(selectedRegion === region ? null : region);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>지역</Text>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {availableRegions.map((region) => {
          const count = regionCounts[region] || 0;
          const isSelected = selectedRegion === region;
          return (
            <TouchableOpacity
              key={region}
              style={[
                styles.regionButton,
                isSelected && styles.selectedRegionButton,
              ]}
              onPress={() => handlePress(region)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${region} ${count}개`}
            >
              <Text
                style={[
                  styles.regionText,
                  isSelected && styles.selectedRegionText,
                ]}
              >
                {region}
              </Text>
              <Text
                style={[
                  styles.countText,
                  isSelected && styles.selectedCountText,
                ]}
              >
                {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  label: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '600',
    width: 36,
    marginLeft: 20,
    flexShrink: 0,
  },
  scrollContainer: {
    paddingRight: 20,
  },
  regionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F2F2F2',
  },
  selectedRegionButton: {
    backgroundColor: '#1A1A1A',
  },
  regionText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  selectedRegionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  countText: {
    fontSize: 10,
    color: '#767676',
    fontWeight: '400',
    marginLeft: 3,
  },
  selectedCountText: {
    color: '#CCCCCC',
  },
});
