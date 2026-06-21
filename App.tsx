import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, PanResponder, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { EventCard } from './components/EventCard';
import { MonthFilter } from './components/MonthFilter';
import { YearFilter } from './components/YearFilter';
import { RegionFilter } from './components/RegionFilter';
import { StatusFilter } from './components/StatusFilter';
import { DistanceFilter } from './components/DistanceFilter';
import { AdBanner } from './components/AdBanner';
import { AppBanner } from './components/AppBanner';
import { NativeAdCard } from './components/NativeAdCard';
import { EventDetailModal } from './components/EventDetailModal';
import { BottomTabBar, TabType } from './components/BottomTabBar';
import { UpcomingScreen } from './components/UpcomingScreen';
import { ForceUpdateModal } from './components/ForceUpdateModal';
import { checkForUpdate } from './utils/versionCheck';
import appJson from './app.json';
import { AdProvider } from './contexts/AdContext';
import { RunningEvent, ListItem } from './types';
import { fetchMarathonEvents, transformMarathonToRunningEvent } from './services/marathonApi';
import { RegistrationStatus, FilterableStatus, getRegistrationStatus, parseRegistrationDates, STATUS_COLORS, STATUS_LABELS } from './utils/registrationStatus';
import { DistanceCategory, getDistanceCategories, DISTANCE_LABELS } from './utils/distanceCategory';
import { sortByRegionOrder } from './utils/regions';
import { insertAds } from './utils/listItems';

const { width: screenWidth } = Dimensions.get('window');

// Skeleton card component with animated opacity
const SkeletonCard = ({ opacity }: { opacity: Animated.Value }) => (
  <Animated.View style={[styles.skeletonCard, { opacity }]}>
    <View style={styles.skeletonDateLine} />
    <View style={styles.skeletonTitleLine} />
    <View style={styles.skeletonSubLine} />
    <View style={styles.skeletonSubLineShort} />
  </Animated.View>
);

export default function App() {
  const [allEvents, setAllEvents] = useState<RunningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [monthByYear, setMonthByYear] = useState<Record<number, number>>({}); // 연도별 선택 월 기억
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<FilterableStatus | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<DistanceCategory | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedEvent, setSelectedEvent] = useState<RunningEvent | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [forceUpdateVisible, setForceUpdateVisible] = useState(false);
  const [forceUpdateUrl, setForceUpdateUrl] = useState('');
  const [forceUpdateMessage, setForceUpdateMessage] = useState<string | undefined>();
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const skeletonOpacity = useRef(new Animated.Value(0.3)).current;
  const swipeHintOpacity = useRef(new Animated.Value(1)).current;
  // Collapsible filter header
  const filterHeight = useRef(new Animated.Value(1)).current; // 1 = expanded, 0 = collapsed
  const lastScrollY = useRef(0);
  const isFilterCollapsed = useRef(false);

  // Skeleton pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonOpacity, {
          toValue: 1.0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(skeletonOpacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Swipe hint auto-hide after 3s
  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => {
        Animated.timing(swipeHintOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setShowSwipeHint(false));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

  useEffect(() => {
    loadMarathonEvents();

    // 강제 업데이트 체크
    const appVersion = appJson.expo.version;
    checkForUpdate(appVersion).then(result => {
      if (result?.needsUpdate) {
        setForceUpdateUrl(result.storeUrl);
        setForceUpdateMessage(result.message);
        setForceUpdateVisible(true);
      }
    });
  }, []);

  const loadMarathonEvents = async () => {
    try {
      setLoading(true);
      setError(null);
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

  // Base events for selected year+month (used for all sub-filter counts)
  const yearMonthEvents = useMemo(() => {
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return event.year === selectedYear && eventDate.getMonth() + 1 === selectedMonth;
    });
  }, [allEvents, selectedYear, selectedMonth]);

  const { availableRegions, regionCounts, yearMonthTotal } = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    yearMonthEvents.forEach(event => {
      total++;
      if (event.region) {
        counts[event.region] = (counts[event.region] || 0) + 1;
      }
    });
    const regions = sortByRegionOrder(Object.keys(counts));
    return { availableRegions: regions, regionCounts: counts, yearMonthTotal: total };
  }, [yearMonthEvents]);

  const statusCounts = useMemo(() => {
    const counts: Record<RegistrationStatus, number> = { open: 0, upcoming: 0, closed: 0, unknown: 0 };
    yearMonthEvents.forEach(event => {
      const status = getRegistrationStatus(event.registrationPeriod);
      counts[status]++;
    });
    return counts;
  }, [yearMonthEvents]);

  const distanceCounts = useMemo(() => {
    const counts: Record<DistanceCategory, number> = { full: 0, half: 0, '10k': 0, '5k': 0, ultra: 0, trail: 0 };
    yearMonthEvents.forEach(event => {
      const categories = getDistanceCategories(event.distance);
      categories.forEach(cat => { counts[cat]++; });
    });
    return counts;
  }, [yearMonthEvents]);

  const filteredEvents = useMemo(() => {
    return yearMonthEvents.filter(event => {
      const matchesRegion = selectedRegion === null || event.region === selectedRegion;
      const matchesStatus = selectedStatus === null || getRegistrationStatus(event.registrationPeriod) === selectedStatus;
      const matchesDistance = selectedDistance === null || getDistanceCategories(event.distance).includes(selectedDistance);
      return matchesRegion && matchesStatus && matchesDistance;
    });
  }, [yearMonthEvents, selectedRegion, selectedStatus, selectedDistance]);

  // Count open + upcoming(30days) events for tab badge
  const upcomingCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + 30);

    let count = 0;
    allEvents.forEach(event => {
      const status = getRegistrationStatus(event.registrationPeriod);
      if (status === 'open') {
        count++;
      } else {
        const dates = parseRegistrationDates(event.registrationPeriod);
        if (dates) {
          const regStart = new Date(dates.start);
          regStart.setHours(0, 0, 0, 0);
          if (regStart > today && regStart <= cutoff) count++;
        }
      }
    });
    return count;
  }, [allEvents]);

  const listItems = useMemo((): ListItem[] => insertAds(filteredEvents, 'home'), [filteredEvents]);

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setSelectedRegion(null);
    scrollToTop();
  };

  const handleYearSelect = (year: number) => {
    // 현재 연도의 선택 월 저장
    setMonthByYear(prev => ({ ...prev, [selectedYear]: selectedMonth }));

    setSelectedYear(year);
    setSelectedRegion(null);
    scrollToTop();

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

  const handleRegionSelect = (region: string | null) => {
    setSelectedRegion(region);
    scrollToTop();
  };

  const handleStatusSelect = (status: FilterableStatus | null) => {
    setSelectedStatus(status);
    scrollToTop();
  };

  const handleDistanceSelect = (distance: DistanceCategory | null) => {
    setSelectedDistance(distance);
    scrollToTop();
  };

  const scrollToNearestEvent = () => {
    if (listItems.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nearestIndex = 0;
    let minDiff = Infinity;

    listItems.forEach((item, index) => {
      if (item.type !== 'event') return;
      const eventDate = new Date(item.data.date);
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

  const panResponder = useMemo(() => PanResponder.create({
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
            setSelectedRegion(null);
            scrollToTop();
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
              setSelectedRegion(null);
              scrollToTop();
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
            setSelectedRegion(null);
            scrollToTop();
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
              setSelectedRegion(null);
              scrollToTop();
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
  }), [availableMonths, selectedMonth, availableYears, selectedYear, allEvents, slideAnim]);

  useEffect(() => {
    if (listItems.length > 0 && isInitialLoad) {
      scrollToNearestEvent();
      setIsInitialLoad(false);
    }
  }, [listItems, isInitialLoad]);

  const handleEventPress = useCallback((event: RunningEvent) => {
    setSelectedEvent(event);
    setModalVisible(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setSelectedEvent(null);
  }, []);

  // Collapsible filter: collapse on scroll down, expand on scroll up
  const handleScroll = useCallback((event: any) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (diff > 8 && !isFilterCollapsed.current && currentY > 10) {
      // Scrolling down - collapse filter
      isFilterCollapsed.current = true;
      Animated.timing(filterHeight, {
        toValue: 0,
        duration: 220,
        useNativeDriver: false,
      }).start();
    } else if (diff < -8 && isFilterCollapsed.current) {
      // Scrolling up - expand filter
      isFilterCollapsed.current = false;
      Animated.timing(filterHeight, {
        toValue: 1,
        duration: 220,
        useNativeDriver: false,
      }).start();
    }

    lastScrollY.current = currentY;
  }, [filterHeight]);

  const renderListItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'ad') {
      return <NativeAdCard />;
    }
    return <EventCard event={item.data} onPress={handleEventPress} />;
  }, [handleEventPress]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.skeletonContainer}>
          <SkeletonCard opacity={skeletonOpacity} />
          <SkeletonCard opacity={skeletonOpacity} />
          <SkeletonCard opacity={skeletonOpacity} />
          <SkeletonCard opacity={skeletonOpacity} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadMarathonEvents}
            accessibilityRole="button"
            accessibilityLabel="다시 시도"
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const summaryParts = [`${selectedYear}년 ${selectedMonth}월`];
    if (selectedStatus) {
      const statusLabels: Record<string, string> = { open: '접수중', closed: '접수마감' };
      const label = statusLabels[selectedStatus];
      if (label) summaryParts.push(label);
    }
    if (selectedDistance) {
      const label = DISTANCE_LABELS[selectedDistance];
      if (label) summaryParts.push(label);
    }
    if (selectedRegion) summaryParts.push(selectedRegion);
    summaryParts.push(`${filteredEvents.length}개 대회`);
    const summaryText = summaryParts.join(' · ');

    return (
      <>
        <Animated.View
          style={[
            styles.filterBlock,
            {
              maxHeight: filterHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 400],
              }),
              opacity: filterHeight,
              overflow: 'hidden',
            },
          ]}
        >
          <YearFilter
            selectedYear={selectedYear}
            onYearSelect={handleYearSelect}
            availableYears={availableYears}
          />
          <MonthFilter
            selectedMonth={selectedMonth}
            onMonthSelect={handleMonthSelect}
            availableMonths={availableMonths}
          />
          <View style={styles.filterDivider} />
          <StatusFilter
            selectedStatus={selectedStatus}
            onStatusSelect={handleStatusSelect}
            statusCounts={statusCounts}
            totalCount={yearMonthTotal}
          />
          <DistanceFilter
            selectedDistance={selectedDistance}
            onDistanceSelect={handleDistanceSelect}
            distanceCounts={distanceCounts}
            totalCount={yearMonthTotal}
          />
          {availableRegions.length > 0 && (
            <RegionFilter
              selectedRegion={selectedRegion}
              onRegionSelect={handleRegionSelect}
              availableRegions={availableRegions}
              regionCounts={regionCounts}
              totalCount={yearMonthTotal}
            />
          )}
        </Animated.View>
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>{summaryText}</Text>
        </View>
        {(selectedStatus !== null || selectedDistance !== null || selectedRegion !== null) && (
          <Animated.View
            style={[
              styles.activeFiltersBar,
              {
                maxHeight: filterHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
                opacity: filterHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
                overflow: 'hidden',
              },
            ]}
          >
            <View style={styles.activeFiltersRow}>
              {selectedStatus && (
                <TouchableOpacity
                  style={[styles.activeFilterChip, { backgroundColor: STATUS_COLORS[selectedStatus].bg }]}
                  onPress={() => setSelectedStatus(null)}
                >
                  <View style={[styles.activeFilterDot, { backgroundColor: STATUS_COLORS[selectedStatus].text }]} />
                  <Text style={[styles.activeFilterText, { color: STATUS_COLORS[selectedStatus].text }]}>
                    {STATUS_LABELS[selectedStatus]}
                  </Text>
                  <Text style={[styles.activeFilterClose, { color: STATUS_COLORS[selectedStatus].text }]}>✕</Text>
                </TouchableOpacity>
              )}
              {selectedDistance && (
                <TouchableOpacity
                  style={styles.activeFilterChip}
                  onPress={() => setSelectedDistance(null)}
                >
                  <Text style={styles.activeFilterText}>
                    {DISTANCE_LABELS[selectedDistance]}
                  </Text>
                  <Text style={styles.activeFilterClose}>✕</Text>
                </TouchableOpacity>
              )}
              {selectedRegion && (
                <TouchableOpacity
                  style={styles.activeFilterChip}
                  onPress={() => handleRegionSelect(null)}
                >
                  <Text style={styles.activeFilterText}>{selectedRegion}</Text>
                  <Text style={styles.activeFilterClose}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}
        {showSwipeHint && (
          <Animated.View style={[styles.swipeHint, { opacity: swipeHintOpacity }]}>
            <Text style={styles.swipeHintText}>← 좌우로 스와이프하여 월 이동 →</Text>
          </Animated.View>
        )}
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
              data={listItems}
              renderItem={renderListItem}
              keyExtractor={(item) => item.type === 'ad' ? item.id : item.data.id}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              onScrollToIndexFailed={(info) => {
                // 인덱스 미측정으로 실패 시 근사 위치로 이동 후 재시도
                flatListRef.current?.scrollToOffset({
                  offset: info.averageItemLength * info.index,
                  animated: false,
                });
                setTimeout(() => {
                  flatListRef.current?.scrollToIndex({
                    index: info.index,
                    animated: true,
                    viewPosition: 0.3,
                  });
                }, 200);
              }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📭</Text>
                  <Text style={styles.emptyText}>해당 조건에 맞는 대회가 없습니다</Text>
                  {(selectedRegion !== null || selectedStatus !== null || selectedDistance !== null) && (
                    <TouchableOpacity
                      style={styles.resetButton}
                      onPress={() => {
                        handleRegionSelect(null);
                        setSelectedStatus(null);
                        setSelectedDistance(null);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="필터 초기화"
                    >
                      <Text style={styles.resetButtonText}>필터 초기화</Text>
                    </TouchableOpacity>
                  )}
                </View>
              }
            />
          </Animated.View>
        </View>
      </>
    );
  };

  return (
    <AdProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <AppBanner />
          {activeTab === 'home' ? (
            renderContent()
          ) : (
            <UpcomingScreen
              allEvents={allEvents}
              onEventPress={handleEventPress}
            />
          )}
          <AdBanner />
          <BottomTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            upcomingCount={upcomingCount}
          />
          <EventDetailModal
            event={selectedEvent}
            visible={modalVisible}
            onClose={handleModalClose}
          />
          <ForceUpdateModal
            visible={forceUpdateVisible}
            storeUrl={forceUpdateUrl}
            message={forceUpdateMessage}
          />
          <StatusBar style="dark" />
        </SafeAreaView>
      </SafeAreaProvider>
    </AdProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filterBlock: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterDivider: {
    height: 1,
    backgroundColor: '#F2F2F2',
    marginHorizontal: 20,
    marginVertical: 4,
  },
  summaryBar: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  summaryText: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '500',
  },
  swipeHint: {
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#F8F8F8',
  },
  swipeHintText: {
    fontSize: 12,
    color: '#BBBBBB',
    fontWeight: '400',
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
    paddingTop: 8,
  },
  skeletonContainer: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  skeletonCard: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  skeletonDateLine: {
    height: 12,
    width: '40%',
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 10,
  },
  skeletonTitleLine: {
    height: 16,
    width: '80%',
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonSubLine: {
    height: 12,
    width: '60%',
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 6,
  },
  skeletonSubLineShort: {
    height: 12,
    width: '40%',
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#FF5733',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FF5733',
  },
  retryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 16,
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activeFiltersBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  activeFilterDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#555555',
    fontWeight: '600',
  },
  activeFilterClose: {
    fontSize: 10,
    color: '#999999',
    fontWeight: '600',
    marginLeft: 2,
  },
});
