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
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 10,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  selectedYearButton: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  yearText: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '500',
  },
  selectedYearText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
