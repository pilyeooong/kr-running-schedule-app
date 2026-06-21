import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export type TabType = 'home' | 'upcoming';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  upcomingCount: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  upcomingCount,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabChange('home')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'home' }}
        accessibilityLabel="대회일정"
      >
        <Ionicons
          name={activeTab === 'home' ? 'calendar' : 'calendar-outline'}
          size={24}
          color={activeTab === 'home' ? '#FF5733' : '#999999'}
        />
        <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
          대회일정
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabChange('upcoming')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'upcoming' }}
        accessibilityLabel={`접수현황 ${upcomingCount}개`}
      >
        <View style={styles.iconWrapper}>
          <Ionicons
            name={activeTab === 'upcoming' ? 'notifications' : 'notifications-outline'}
            size={24}
            color={activeTab === 'upcoming' ? '#FF5733' : '#999999'}
          />
          {upcomingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {upcomingCount > 99 ? '99+' : upcomingCount}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.tabLabel, activeTab === 'upcoming' && styles.tabLabelActive]}>
          접수현황
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    color: '#999999',
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#FF5733',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -12,
    backgroundColor: '#FF5733',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
