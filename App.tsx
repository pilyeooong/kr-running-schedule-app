import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, PanResponder, Animated, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { EventCard } from './components/EventCard';
import { MonthFilter } from './components/MonthFilter';
import { YearFilter } from './components/YearFilter';
import { AdBanner } from './components/AdBanner';
import { AppBanner } from './components/AppBanner';
import { RunningEvent } from './types';
import { fetchMarathonEvents, transformMarathonToRunningEvent } from './services/marathonApi';

const { width: screenWidth } = Dimensions.get('window');

export default function App() {
  const [allEvents, setAllEvents] = useState<RunningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [monthByYear, setMonthByYear] = useState<Record<number, number>>({}); // 연도별 선택 월 기억
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMarathonEvents();
  }, []);

  const loadMarathonEvents = async () => {
    try {
      setLoading(true);
      const marathonEvents = await fetchMarathonEvents();
      const runningEvents = marathonEvents.map((event, index) => transformMarathonToRunningEvent(event, index));
      setAllEvents(runningEvents);
    } catch (err) {
      setError('마라톤 대회 정보를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    allEvents.forEach(event => {
      years.add(event.year);
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [allEvents]);

  // 데이터 로드 후 현재 연도가 없으면 가장 가까운 연도 선택
  useEffect(() => {
    if (availableYears.length > 0) {
      const currentYear = new Date().getFullYear();
      if (availableYears.includes(currentYear)) {
        setSelectedYear(currentYear);
      } else {
        // 현재 연도와 가장 가까운 연도 선택
        const closestYear = availableYears.reduce((prev, curr) =>
          Math.abs(curr - currentYear) < Math.abs(prev - currentYear) ? curr : prev
        );
        setSelectedYear(closestYear);
      }
    }
  }, [availableYears]);

  const availableMonths = useMemo(() => {
    const months = new Set<number>();
    allEvents
      .filter(event => event.year === selectedYear)
      .forEach(event => {
        const eventDate = new Date(event.date);
        months.add(eventDate.getMonth() + 1);
      });
    return Array.from(months).sort((a, b) => a - b);
  }, [allEvents, selectedYear]);

  // 초기 로드 시에만 현재 월 선택 (연도 변경 시에는 handleYearSelect에서 처리)
  const isInitialMonthSet = useRef(false);
  useEffect(() => {
    if (availableMonths.length > 0 && !isInitialMonthSet.current) {
      isInitialMonthSet.current = true;
      const currentMonth = new Date().getMonth() + 1;
      if (availableMonths.includes(currentMonth)) {
        setSelectedMonth(currentMonth);
      } else {
        // 현재 월과 가장 가까운 월 선택
        const closestMonth = availableMonths.reduce((prev, curr) =>
          Math.abs(curr - currentMonth) < Math.abs(prev - currentMonth) ? curr : prev
        );
        setSelectedMonth(closestMonth);
      }
    }
  }, [availableMonths]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return event.year === selectedYear && eventDate.getMonth() + 1 === selectedMonth;
    });
  }, [allEvents, selectedYear, selectedMonth]);

  const handleYearSelect = (year: number) => {
    // 현재 연도의 선택 월 저장
    setMonthByYear(prev => ({ ...prev, [selectedYear]: selectedMonth }));

    setSelectedYear(year);

    // 해당 연도에 저장된 월이 있으면 그 월로, 없으면 첫 번째 월로
    const monthsInYear = allEvents
      .filter(event => event.year === year)
      .map(event => new Date(event.date).getMonth() + 1);
    const uniqueMonths = [...new Set(monthsInYear)].sort((a, b) => a - b);

    if (uniqueMonths.length > 0) {
      const savedMonth = monthByYear[year];
      if (savedMonth && uniqueMonths.includes(savedMonth)) {
        setSelectedMonth(savedMonth);
      } else {
        setSelectedMonth(uniqueMonths[0]);
      }
    }
  };

  const scrollToNearestEvent = () => {
    if (filteredEvents.length === 0) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let nearestIndex = 0;
    let minDiff = Infinity;
    
    filteredEvents.forEach((event, index) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      const diff = Math.abs(eventDate.getTime() - today.getTime());
      
      if (diff < minDiff) {
        minDiff = diff;
        nearestIndex = index;
      }
    });
    
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: nearestIndex,
        animated: true,
        viewPosition: 0.3,
      });
    }, 300);
  };

  const animateSlide = (direction: 'left' | 'right', callback: () => void) => {
    const toValue = direction === 'left' ? -screenWidth : screenWidth;
    
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
    
    // 애니메이션 중간에 월 변경
    setTimeout(callback, 100);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      return Math.abs(dx) > Math.abs(dy) * 2 && Math.abs(dx) > 20;
    },
    onPanResponderGrant: () => true,
    onPanResponderMove: (evt, gestureState) => {
      // 실시간으로 드래그 따라 이동
      const { dx } = gestureState;
      const clampedDx = Math.max(-screenWidth * 0.3, Math.min(screenWidth * 0.3, dx));
      slideAnim.setValue(clampedDx);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const swipeThreshold = 80;
      const currentIndex = availableMonths.indexOf(selectedMonth);
      const currentYearIndex = availableYears.indexOf(selectedYear);

      if (gestureState.dx > swipeThreshold) {
        // 오른쪽으로 swipe -> 이전 월
        if (currentIndex > 0) {
          animateSlide('right', () => {
            setSelectedMonth(availableMonths[currentIndex - 1]);
          });
        } else if (currentYearIndex > 0) {
          // 이전 연도의 마지막 월로 이동
          const prevYear = availableYears[currentYearIndex - 1];
          const prevYearMonths = allEvents
            .filter(event => event.year === prevYear)
            .map(event => new Date(event.date).getMonth() + 1);
          const uniquePrevMonths = [...new Set(prevYearMonths)].sort((a, b) => a - b);
          if (uniquePrevMonths.length > 0) {
            animateSlide('right', () => {
              setSelectedYear(prevYear);
              setSelectedMonth(uniquePrevMonths[uniquePrevMonths.length - 1]);
            });
          }
        } else {
          Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        }
      } else if (gestureState.dx < -swipeThreshold) {
        // 왼쪽으로 swipe -> 다음 월
        if (currentIndex < availableMonths.length - 1) {
          animateSlide('left', () => {
            setSelectedMonth(availableMonths[currentIndex + 1]);
          });
        } else if (currentYearIndex < availableYears.length - 1) {
          // 다음 연도의 첫 번째 월로 이동
          const nextYear = availableYears[currentYearIndex + 1];
          const nextYearMonths = allEvents
            .filter(event => event.year === nextYear)
            .map(event => new Date(event.date).getMonth() + 1);
          const uniqueNextMonths = [...new Set(nextYearMonths)].sort((a, b) => a - b);
          if (uniqueNextMonths.length > 0) {
            animateSlide('left', () => {
              setSelectedYear(nextYear);
              setSelectedMonth(uniqueNextMonths[0]);
            });
          }
        } else {
          Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        }
      } else {
        // 스와이프가 충분하지 않으면 원래 위치로 복귀
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  useEffect(() => {
    if (filteredEvents.length > 0 && isInitialLoad) {
      scrollToNearestEvent();
      setIsInitialLoad(false);
    }
  }, [filteredEvents, isInitialLoad]);

  const renderEventCard = ({ item }: { item: RunningEvent }) => (
    <EventCard event={item} />
  );

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <AppBanner />
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>대회 정보를 불러오는 중...</Text>
          </View>
          <StatusBar style="auto" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <AppBanner />
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
          <StatusBar style="auto" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <AppBanner />
        <YearFilter
          selectedYear={selectedYear}
          onYearSelect={handleYearSelect}
          availableYears={availableYears}
        />
        <MonthFilter
          selectedMonth={selectedMonth}
          onMonthSelect={setSelectedMonth}
          availableMonths={availableMonths}
        />
        <View style={styles.listContainer} {...panResponder.panHandlers}>
          <Animated.View 
            style={[
              styles.animatedContainer,
              {
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            <FlatList
              ref={flatListRef}
              data={filteredEvents}
              renderItem={renderEventCard}
              keyExtractor={(item) => item.id}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              onScrollToIndexFailed={() => {}}
            />
          </Animated.View>
        </View>
        <AdBanner />
        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  animatedContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
    paddingTop: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
});
