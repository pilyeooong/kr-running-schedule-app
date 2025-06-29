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

const BUTTON_WIDTH = 64; // 버튼 너비 + 마진

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
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  monthButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedMonthButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  monthText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedMonthText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});