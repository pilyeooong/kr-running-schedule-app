import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Keyboard,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RunningEvent } from '../types';
import { EventCard } from './EventCard';
import { Dropdown, DropdownOption } from './Dropdown';
import { searchEvents, SearchSort } from '../utils/search';

const SORT_OPTIONS: DropdownOption<SearchSort>[] = [
  { label: '가까운 날짜순', value: 'dateAsc' },
  { label: '먼 날짜순', value: 'dateDesc' },
];

interface SearchModalProps {
  visible: boolean;
  allEvents: RunningEvent[];
  onClose: () => void;
  onEventPress: (event: RunningEvent) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  allEvents,
  onClose,
  onEventPress,
}) => {
  const [query, setQuery] = useState('');
  const [includePast, setIncludePast] = useState(false);
  const [sort, setSort] = useState<SearchSort>('dateAsc');
  const inputRef = useRef<TextInput>(null);

  // 모달이 열릴 때마다 입력 초기화 + 포커스, 닫힐 때 정리
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
    setQuery('');
    setIncludePast(false);
    setSort('dateAsc');
  }, [visible]);

  const results = useMemo(
    () => searchEvents(allEvents, query, { includePast, sort }),
    [allEvents, query, includePast, sort]
  );
  const trimmed = query.trim();

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const handleSelect = useCallback(
    (event: RunningEvent) => {
      Keyboard.dismiss();
      onEventPress(event);
    },
    [onEventPress]
  );

  const renderItem = useCallback(
    ({ item }: { item: RunningEvent }) => <EventCard event={item} onPress={handleSelect} />,
    [handleSelect]
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* 검색 입력 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="검색 닫기"
          >
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <Ionicons name="search" size={18} color="#999999" style={styles.inputIcon} />
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="대회명, 지역, 장소 검색"
              placeholderTextColor="#BBBBBB"
              returnKeyType="search"
              autoCorrect={false}
              clearButtonMode="never"
              accessibilityLabel="검색어 입력"
            />
            {trimmed.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery('')}
                style={styles.clearButton}
                accessibilityRole="button"
                accessibilityLabel="검색어 지우기"
              >
                <Ionicons name="close-circle" size={18} color="#CCCCCC" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 필터바 (결과 유무와 무관하게 항상 노출, 항목 추가 확장 가능) */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setIncludePast(prev => !prev)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: includePast }}
            accessibilityLabel="지난 대회 포함"
          >
            <Ionicons
              name={includePast ? 'checkbox' : 'square-outline'}
              size={18}
              color={includePast ? '#FF5733' : '#BBBBBB'}
            />
            <Text style={styles.checkboxLabel}>지난 대회 포함</Text>
          </TouchableOpacity>

          <View style={styles.filterSpacer} />

          <Dropdown value={sort} options={SORT_OPTIONS} onChange={setSort} />
        </View>

        {/* 본문 */}
        {trimmed.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="search-outline" size={48} color="#E0E0E0" />
            <Text style={styles.hintText}>대회명, 지역, 장소로 검색해 보세요</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              results.length > 0 ? (
                <Text style={styles.resultCount}>{results.length}개 검색 결과</Text>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Ionicons name="sad-outline" size={48} color="#E0E0E0" />
                <Text style={styles.hintText}>'{trimmed}'에 대한 결과가 없습니다</Text>
              </View>
            }
          />
        )}
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 4,
  },
  backButton: {
    padding: 6,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 6,
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#444444',
    fontWeight: '500',
  },
  filterSpacer: {
    flex: 1,
  },
  list: {
    flex: 1,
    paddingTop: 4,
  },
  resultCount: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '500',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 2,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  hintText: {
    fontSize: 15,
    color: '#999999',
    textAlign: 'center',
    marginTop: 14,
  },
});
