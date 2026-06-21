import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AppBannerProps {
  onSearchPress?: () => void;
}

export const AppBanner: React.FC<AppBannerProps> = ({ onSearchPress }) => {
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>러닝 캘린더</Text>
      {onSearchPress && (
        <TouchableOpacity
          style={styles.searchButton}
          onPress={onSearchPress}
          accessibilityRole="button"
          accessibilityLabel="대회 검색"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="search" size={22} color="#1A1A1A" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  searchButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});
