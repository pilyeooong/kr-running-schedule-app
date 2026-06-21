import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface YearFilterProps {
  selectedYear: number;
  onYearSelect: (year: number) => void;
  availableYears: number[];
}

export const YearFilter: React.FC<YearFilterProps> = ({
  selectedYear,
  onYearSelect,
  availableYears,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {availableYears.map((year) => (
          <TouchableOpacity
            key={year}
            style={[
              styles.yearButton,
              selectedYear === year && styles.selectedYearButton,
            ]}
            onPress={() => onYearSelect(year)}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedYear === year }}
            accessibilityLabel={`${year}년`}
          >
            <Text
              style={[
                styles.yearText,
                selectedYear === year && styles.selectedYearText,
              ]}
            >
              {year}년
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingBottom: 4,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 18,
    backgroundColor: '#F2F2F2',
  },
  selectedYearButton: {
    backgroundColor: '#1A1A1A',
  },
  yearText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  selectedYearText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
