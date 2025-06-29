import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RunningEvent } from '../types';

interface EventCardProps {
  event: RunningEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString('ko-KR', { month: 'short' }),
      day: date.getDate().toString(),
    };
  };

  const { month, day } = formatDate(event.date);

  return (
    <View style={styles.card}>
      <View style={styles.dateContainer}>
        <Text style={styles.month}>{month}</Text>
        <Text style={styles.day}>{day}</Text>
        {event.dayOfWeek && (
          <Text style={styles.dayOfWeek}>{event.dayOfWeek}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.eventName}>{event.name}</Text>
        <Text style={styles.organizer}>{event.organizer}</Text>
        <Text style={styles.distance}>{event.distance}</Text>
        {event.location && (
          <Text style={styles.location}>📍 {event.location}</Text>
        )}
        {event.phone && (
          <Text style={styles.phone}>📞 {event.phone}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
  },
  dateContainer: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    paddingRight: 16,
  },
  month: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  day: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
  },
  dayOfWeek: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  infoContainer: {
    flex: 1,
    paddingLeft: 16,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  organizer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  distance: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  phone: {
    fontSize: 12,
    color: '#999',
  },
});