import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { DistanceCategory, DISTANCE_LABELS, DISTANCE_ORDER } from '../utils/distanceCategory';

type DistanceOption = DistanceCategory | null;

interface DistanceFilterProps {
  selectedDistance: DistanceOption;
  onDistanceSelect: (distance: DistanceOption) => void;
  distanceCounts: Record<DistanceCategory, number>;
  totalCount: number;
}

export const DistanceFilter: React.FC<DistanceFilterProps> = ({
  selectedDistance,
  onDistanceSelect,
  distanceCounts,
}) => {
  const availableDistances = DISTANCE_ORDER.filter(d => (distanceCounts[d] || 0) > 0);
  if (availableDistances.length === 0) return null;

  const handlePress = (distance: DistanceCategory) => {
    onDistanceSelect(selectedDistance === distance ? null : distance);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>거리</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {availableDistances.map((distance) => {
          const isSelected = selectedDistance === distance;
          const count = distanceCounts[distance] || 0;
          return (
            <TouchableOpacity
              key={distance}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
              ]}
              onPress={() => handlePress(distance)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${DISTANCE_LABELS[distance]} ${count}개`}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
              >
                {DISTANCE_LABELS[distance]}
              </Text>
              <Text
                style={[
                  styles.countText,
                  isSelected && styles.countTextSelected,
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
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F2F2F2',
  },
  chipSelected: {
    backgroundColor: '#1A1A1A',
  },
  chipText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  countText: {
    fontSize: 10,
    color: '#767676',
    fontWeight: '400',
    marginLeft: 3,
  },
  countTextSelected: {
    color: '#CCCCCC',
  },
});
