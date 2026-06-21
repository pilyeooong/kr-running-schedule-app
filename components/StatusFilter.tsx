import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { FilterableStatus, FILTERABLE_STATUSES, STATUS_LABELS, STATUS_COLORS } from '../utils/registrationStatus';

type StatusOption = FilterableStatus | null;

interface StatusFilterProps {
  selectedStatus: StatusOption;
  onStatusSelect: (status: StatusOption) => void;
  statusCounts: Record<string, number>;
  totalCount: number;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  selectedStatus,
  onStatusSelect,
  statusCounts,
}) => {
  const availableStatuses = FILTERABLE_STATUSES.filter(s => (statusCounts[s] || 0) > 0);
  if (availableStatuses.length === 0) return null;

  const handlePress = (status: FilterableStatus) => {
    onStatusSelect(selectedStatus === status ? null : status);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>접수</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {availableStatuses.map((status) => {
          const isSelected = selectedStatus === status;
          const count = statusCounts[status] || 0;
          const colors = STATUS_COLORS[status];
          return (
            <TouchableOpacity
              key={status}
              style={[
                styles.chip,
                isSelected
                  ? { backgroundColor: colors.text }
                  : { backgroundColor: colors.bg },
              ]}
              onPress={() => handlePress(status)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${STATUS_LABELS[status]} ${count}개`}
            >
              {!isSelected && (
                <View style={[styles.dot, { backgroundColor: colors.text }]} />
              )}
              <Text
                style={[
                  styles.chipText,
                  isSelected
                    ? { color: '#FFFFFF', fontWeight: 'bold' }
                    : { color: colors.text },
                ]}
              >
                {STATUS_LABELS[status]}
              </Text>
              <Text
                style={[
                  styles.countText,
                  isSelected
                    ? { color: 'rgba(255,255,255,0.7)' }
                    : { color: colors.text, opacity: 0.6 },
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
  chipText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  countText: {
    fontSize: 10,
    color: '#767676',
    fontWeight: '400',
    marginLeft: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 5,
  },
});
