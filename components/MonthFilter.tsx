import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface MonthFilterProps {
  selectedMonth: number;
  onMonthSelect: (month: number) => void;
  availableMonths: number[];
}

const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
];

const BUTTON_WIDTH = 58;

export const MonthFilter: React.FC<MonthFilterProps> = ({
  selectedMonth,
  onMonthSelect,
  availableMonths,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current && availableMonths.length > 0) {
      const selectedIndex = availableMonths.indexOf(selectedMonth);
      if (selectedIndex !== -1) {
        const scrollX = selectedIndex * BUTTON_WIDTH;
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: scrollX,
            animated: true,
          });
        }, 100);
      }
    }
  }, [selectedMonth, availableMonths]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {availableMonths.map((month) => (
          <TouchableOpacity
            key={month}
            style={[
              styles.monthButton,
              selectedMonth === month && styles.selectedMonthButton,
            ]}
            onPress={() => onMonthSelect(month)}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedMonth === month }}
            accessibilityLabel={`${MONTH_NAMES[month - 1]}`}
          >
            <Text
              style={[
                styles.monthText,
                selectedMonth === month && styles.selectedMonthText,
              ]}
            >
              {MONTH_NAMES[month - 1]}
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
    paddingTop: 4,
    paddingBottom: 6,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 18,
    backgroundColor: '#F2F2F2',
  },
  selectedMonthButton: {
    backgroundColor: '#1A1A1A',
  },
  monthText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  selectedMonthText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
