import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AppBanner: React.FC = () => {
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>러닝 캘린더</Text>
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
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
