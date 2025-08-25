import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export const AppBanner: React.FC = () => {
  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <RunnerIcon />
        <View style={styles.textContainer}>
          <Text style={styles.title}>한국 러닝 대회 일정</Text>
          <Text style={styles.subtitle}>{new Date().getMonth() + 1}월 대회 일정</Text>
        </View>
        <RunnerIcon style={styles.rightRunner} />
      </View>
    </View>
  );
};

const RunnerIcon: React.FC<{ style?: any }> = ({ style }) => (
  <Svg width="40" height="40" viewBox="0 0 24 24" fill="white" style={style}>
    <Path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
  </Svg>
);

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#2196F3',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  rightRunner: {
    transform: [{ scaleX: -1 }],
  },
});