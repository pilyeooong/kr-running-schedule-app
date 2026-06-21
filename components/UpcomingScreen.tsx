import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, Animated, StyleSheet } from 'react-native';
import { RunningEvent, ListItem } from '../types';
import { EventCard } from './EventCard';
import { NativeAdCard } from './NativeAdCard';
import { getRegistrationStatus, parseRegistrationDates } from '../utils/registrationStatus';
import { DistanceCategory, getDistanceCategories, DISTANCE_LABELS, DISTANCE_ORDER } from '../utils/distanceCategory';
import { sortByRegionOrder } from '../utils/regions';
import { insertAds } from '../utils/listItems';

type SegmentType = 'open' | 'upcoming';

interface UpcomingScreenProps {
  allEvents: RunningEvent[];
  onEventPress: (event: RunningEvent) => void;
}

const DAYS_AHEAD = 30;

interface UpcomingEvent extends RunningEvent {
  regStartDate: Date;
  daysUntilOpen: number;
}

export const UpcomingScreen: React.FC<UpcomingScreenProps> = ({
  allEvents,
  onEventPress,
}) => {
  const [segment, setSegment] = useState<SegmentType>('open');
  const [selectedDistance, setSelectedDistance] = useState<DistanceCategory | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Collapsible filter
  const filterHeight = useRef(new Animated.Value(1)).current;
  const lastScrollY = useRef(0);
  const isFilterCollapsed = useRef(false);

  const handleScroll = useCallback((event: any) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (diff > 8 && !isFilterCollapsed.current && currentY > 10) {
      isFilterCollapsed.current = true;
      Animated.timing(filterHeight, {
        toValue: 0,
        duration: 220,
        useNativeDriver: false,
      }).start();
    } else if (diff < -8 && isFilterCollapsed.current) {
      isFilterCollapsed.current = false;
      Animated.timing(filterHeight, {
        toValue: 1,
        duration: 220,
        useNativeDriver: false,
      }).start();
    }

    lastScrollY.current = currentY;
  }, [filterHeight]);

  // 접수중인 대회
  const openEvents = useMemo(() => {
    return allEvents
      .filter(event => getRegistrationStatus(event.registrationPeriod) === 'open')
      .sort((a, b) => {
        const dateA = parseRegistrationDates(a.registrationPeriod);
        const dateB = parseRegistrationDates(b.registrationPeriod);
        if (!dateA || !dateB) return 0;
        return dateA.end.getTime() - dateB.end.getTime();
      });
  }, [allEvents]);

  // 접수 곧 시작 (30일 이내)
  const upcomingEvents = useMemo((): UpcomingEvent[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + DAYS_AHEAD);

    return allEvents
      .map(event => {
        const dates = parseRegistrationDates(event.registrationPeriod);
        if (!dates) return null;
        const regStart = new Date(dates.start);
        regStart.setHours(0, 0, 0, 0);
        if (regStart <= today || regStart > cutoff) return null;
        const diffMs = regStart.getTime() - today.getTime();
        const daysUntilOpen = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return { ...event, regStartDate: regStart, daysUntilOpen };
      })
      .filter((e): e is UpcomingEvent => e !== null)
      .sort((a, b) => a.regStartDate.getTime() - b.regStartDate.getTime());
  }, [allEvents]);

  const baseEvents: RunningEvent[] = segment === 'open' ? openEvents : upcomingEvents;

  const { distanceCounts, regionCounts, availableRegions } = useMemo(() => {
    const dCounts: Record<DistanceCategory, number> = { full: 0, half: 0, '10k': 0, '5k': 0, ultra: 0, trail: 0 };
    const rCounts: Record<string, number> = {};

    baseEvents.forEach(event => {
      getDistanceCategories(event.distance).forEach(cat => { dCounts[cat]++; });
      if (event.region) {
        rCounts[event.region] = (rCounts[event.region] || 0) + 1;
      }
    });

    const regions = sortByRegionOrder(Object.keys(rCounts));

    return { distanceCounts: dCounts, regionCounts: rCounts, availableRegions: regions };
  }, [baseEvents]);

  const filteredOpen = useMemo(() => {
    if (selectedDistance === null && selectedRegion === null) return openEvents;
    return openEvents.filter(event => {
      const matchDist = selectedDistance === null || getDistanceCategories(event.distance).includes(selectedDistance);
      const matchReg = selectedRegion === null || event.region === selectedRegion;
      return matchDist && matchReg;
    });
  }, [openEvents, selectedDistance, selectedRegion]);

  const filteredUpcoming = useMemo(() => {
    if (selectedDistance === null && selectedRegion === null) return upcomingEvents;
    return upcomingEvents.filter(event => {
      const matchDist = selectedDistance === null || getDistanceCategories(event.distance).includes(selectedDistance);
      const matchReg = selectedRegion === null || event.region === selectedRegion;
      return matchDist && matchReg;
    });
  }, [upcomingEvents, selectedDistance, selectedRegion]);

  const hasActiveFilter = selectedDistance !== null || selectedRegion !== null;

  const handleSegmentChange = useCallback((seg: SegmentType) => {
    setSegment(seg);
    setSelectedDistance(null);
    setSelectedRegion(null);
    // 필터 다시 펼치기
    if (isFilterCollapsed.current) {
      isFilterCollapsed.current = false;
      filterHeight.setValue(1);
    }
  }, [filterHeight]);

  const handleDistanceToggle = useCallback((dist: DistanceCategory) => {
    setSelectedDistance(prev => prev === dist ? null : dist);
  }, []);

  const handleRegionToggle = useCallback((region: string) => {
    setSelectedRegion(prev => prev === region ? null : region);
  }, []);

  const formatRegStart = useCallback((date: Date) => {
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  }, []);

  const formatRegEnd = useCallback((event: RunningEvent) => {
    const dates = parseRegistrationDates(event.registrationPeriod);
    if (!dates) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(dates.end);
    end.setHours(0, 0, 0, 0);
    const diffMs = end.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return null;
    const endStr = end.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    return { daysLeft, endStr };
  }, []);

  const renderOpenItem = useCallback(({ item }: { item: RunningEvent }) => {
    const info = formatRegEnd(item);
    return (
      <View>
        {info && (
          <View style={styles.dDayBadge}>
            <Text style={[styles.dDayText, info.daysLeft <= 7 ? styles.dDayUrgent : styles.dDayNormal]}>
              {info.daysLeft === 0 ? 'D-Day' : `D-${info.daysLeft}`}
            </Text>
            <Text style={styles.regDateText}>{info.endStr} 접수 마감</Text>
          </View>
        )}
        <EventCard event={item} onPress={onEventPress} />
      </View>
    );
  }, [formatRegEnd, onEventPress]);

  const renderUpcomingItem = useCallback(({ item }: { item: UpcomingEvent }) => (
    <View>
      <View style={styles.dDayBadge}>
        <Text style={styles.dDayText}>D-{item.daysUntilOpen}</Text>
        <Text style={styles.regDateText}>{formatRegStart(item.regStartDate)} 접수 시작</Text>
      </View>
      <EventCard event={item} onPress={onEventPress} />
    </View>
  ), [formatRegStart, onEventPress]);

  const availableDistances = useMemo(
    () => DISTANCE_ORDER.filter(d => distanceCounts[d] > 0),
    [distanceCounts]
  );
  const hasFilters = availableDistances.length > 0 || availableRegions.length > 0;

  const openListItems = useMemo(() => insertAds(filteredOpen, 'open'), [filteredOpen]);
  const upcomingListItems = useMemo(() => insertAds(filteredUpcoming, 'upcoming'), [filteredUpcoming]);

  const renderOpenListItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'ad') return <NativeAdCard />;
    return renderOpenItem({ item: item.data });
  }, [renderOpenItem]);

  const renderUpcomingListItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'ad') return <NativeAdCard />;
    return renderUpcomingItem({ item: item.data as UpcomingEvent });
  }, [renderUpcomingItem]);

  const emptyComponent = useCallback((defaultMsg: string) => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyText}>
        {hasActiveFilter ? '조건에 맞는 대회가 없습니다' : defaultMsg}
      </Text>
      {hasActiveFilter && (
        <TouchableOpacity style={styles.resetButton} onPress={() => { setSelectedDistance(null); setSelectedRegion(null); }}>
          <Text style={styles.resetButtonText}>필터 초기화</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [hasActiveFilter]);

  return (
    <View style={styles.container}>
      {/* 세그먼트 (항상 보임) */}
      <View style={styles.segmentBar}>
        <TouchableOpacity
          style={[styles.segmentButton, segment === 'open' && styles.segmentButtonActive]}
          onPress={() => handleSegmentChange('open')}
        >
          <Text style={[styles.segmentText, segment === 'open' && styles.segmentTextActive]}>접수중</Text>
          <View style={[styles.segmentCount, segment === 'open' ? styles.segmentCountActive : null]}>
            <Text style={[styles.segmentCountText, segment === 'open' && styles.segmentCountTextActive]}>
              {openEvents.length}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, segment === 'upcoming' && styles.segmentButtonActive]}
          onPress={() => handleSegmentChange('upcoming')}
        >
          <Text style={[styles.segmentText, segment === 'upcoming' && styles.segmentTextActive]}>접수 곧 시작</Text>
          <View style={[styles.segmentCount, segment === 'upcoming' ? styles.segmentCountActive : null]}>
            <Text style={[styles.segmentCountText, segment === 'upcoming' && styles.segmentCountTextActive]}>
              {upcomingEvents.length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 접히는 필터 영역 */}
      {hasFilters && (
        <Animated.View
          style={[
            styles.filterSection,
            {
              maxHeight: filterHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 200],
              }),
              opacity: filterHeight,
              overflow: 'hidden',
            },
          ]}
        >
          {availableDistances.length > 0 && (
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>거리</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {availableDistances.map(dist => {
                  const isSelected = selectedDistance === dist;
                  return (
                    <TouchableOpacity
                      key={dist}
                      style={[styles.filterChip, isSelected && styles.filterChipActive]}
                      onPress={() => handleDistanceToggle(dist)}
                    >
                      <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                        {DISTANCE_LABELS[dist]}
                      </Text>
                      <Text style={[styles.filterChipCount, isSelected && styles.filterChipCountActive]}>
                        {distanceCounts[dist]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
          {availableRegions.length > 0 && (
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>지역</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {availableRegions.map(region => {
                  const isSelected = selectedRegion === region;
                  return (
                    <TouchableOpacity
                      key={region}
                      style={[styles.filterChip, isSelected && styles.filterChipActive]}
                      onPress={() => handleRegionToggle(region)}
                    >
                      <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                        {region}
                      </Text>
                      <Text style={[styles.filterChipCount, isSelected && styles.filterChipCountActive]}>
                        {regionCounts[region]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </Animated.View>
      )}

      {/* 활성 필터 칩 (필터 접혔을 때만 보임) */}
      {hasActiveFilter && (
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
            {selectedDistance && (
              <TouchableOpacity
                style={styles.activeChip}
                onPress={() => setSelectedDistance(null)}
              >
                <Text style={styles.activeChipText}>{DISTANCE_LABELS[selectedDistance]}</Text>
                <Text style={styles.activeChipClose}>✕</Text>
              </TouchableOpacity>
            )}
            {selectedRegion && (
              <TouchableOpacity
                style={styles.activeChip}
                onPress={() => setSelectedRegion(null)}
              >
                <Text style={styles.activeChipText}>{selectedRegion}</Text>
                <Text style={styles.activeChipClose}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}

      {/* 리스트 */}
      {segment === 'open' ? (
        <FlatList
          data={openListItems}
          renderItem={renderOpenListItem}
          keyExtractor={(item) => item.type === 'ad' ? item.id : item.data.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={emptyComponent('현재 접수중인 대회가 없습니다')}
        />
      ) : (
        <FlatList
          data={upcomingListItems}
          renderItem={renderUpcomingListItem}
          keyExtractor={(item) => item.type === 'ad' ? item.id : item.data.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={emptyComponent('30일 이내 접수 시작 예정인 대회가 없습니다')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  segmentBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  segmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#1A1A1A',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#767676',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  segmentCount: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  segmentCountActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  segmentCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#767676',
  },
  segmentCountTextActive: {
    color: '#FFFFFF',
  },
  filterSection: {
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  filterLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '600',
    width: 36,
    marginLeft: 20,
    flexShrink: 0,
  },
  filterScroll: {
    paddingRight: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F2F2F2',
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: '#1A1A1A',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  filterChipCount: {
    fontSize: 10,
    color: '#999999',
    fontWeight: '400',
  },
  filterChipCountActive: {
    color: 'rgba(255,255,255,0.6)',
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
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  activeChipText: {
    fontSize: 12,
    color: '#555555',
    fontWeight: '600',
  },
  activeChipClose: {
    fontSize: 10,
    color: '#999999',
    fontWeight: '600',
    marginLeft: 2,
  },
  list: {
    flex: 1,
    paddingTop: 4,
  },
  dDayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 2,
    gap: 8,
  },
  dDayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5733',
  },
  dDayNormal: {
    color: '#2E7D32',
  },
  dDayUrgent: {
    color: '#FF5733',
  },
  regDateText: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
});
