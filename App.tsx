import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { EventCard } from './components/EventCard';
import { MonthFilter } from './components/MonthFilter';
import { AdBanner } from './components/AdBanner';
import { AppBanner } from './components/AppBanner';
import { RunningEvent } from './types';
import { fetchMarathonEvents, transformMarathonToRunningEvent } from './services/marathonApi';

export default function App() {
  const [allEvents, setAllEvents] = useState<RunningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const flatListRef = useRef<FlatList>(null);

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

  const availableMonths = useMemo(() => {
    const months = new Set<number>();
    allEvents.forEach(event => {
      const eventDate = new Date(event.date);
      months.add(eventDate.getMonth() + 1);
    });
    return Array.from(months).sort((a, b) => a - b);
  }, [allEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() + 1 === selectedMonth;
    });
  }, [allEvents, selectedMonth]);

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
        <MonthFilter
          selectedMonth={selectedMonth}
          onMonthSelect={setSelectedMonth}
          availableMonths={availableMonths}
        />
        <FlatList
          ref={flatListRef}
          data={filteredEvents}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={() => {}}
        />
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
