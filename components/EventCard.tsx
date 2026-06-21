import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RunningEvent } from '../types';
import { getRegistrationStatus, STATUS_LABELS, STATUS_COLORS } from '../utils/registrationStatus';

interface EventCardProps {
  event: RunningEvent;
  onPress?: (event: RunningEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString('ko-KR', { month: 'short' }),
      day: date.getDate().toString(),
    };
  };

  const { month, day } = formatDate(event.date);
  const regStatus = getRegistrationStatus(event.registrationPeriod);
  const statusColors = STATUS_COLORS[regStatus];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(event)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${event.name}, ${event.date}${event.dayOfWeek ? ` ${event.dayOfWeek}` : ''}, ${event.distance}${event.location ? `, ${event.location}` : ''}`}
    >
      <View style={styles.dateContainer}>
        <Text style={styles.month}>{month}</Text>
        <Text style={styles.day}>{day}</Text>
        {event.dayOfWeek && (
          <Text style={styles.dayOfWeek}>{event.dayOfWeek}</Text>
        )}
        {event.startTime && (
          <Text style={styles.startTime}>{event.startTime}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.eventName}>{event.name}</Text>
        <Text style={styles.organizer}>{event.organizer}</Text>
        <Text style={styles.distance}>{event.distance}</Text>
        {event.location && (
          <Text style={styles.location}>📍 {event.location}</Text>
        )}
        <View style={styles.badgeRow}>
          {regStatus !== 'unknown' && (
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColors.text }]} />
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {STATUS_LABELS[regStatus]}
              </Text>
            </View>
          )}
          {event.region && (
            <View style={styles.regionBadge}>
              <Text style={styles.regionText}>{event.region}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    minHeight: 48,
  },
  dateContainer: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginRight: 14,
  },
  month: {
    fontSize: 12,
    color: '#767676',
    textAlign: 'center',
    fontWeight: '400',
  },
  day: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF5733',
    textAlign: 'center',
  },
  dayOfWeek: {
    fontSize: 12,
    color: '#767676',
    textAlign: 'center',
    marginTop: 2,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  organizer: {
    fontSize: 13,
    color: '#767676',
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: '#FF5733',
    fontWeight: '600',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: '#767676',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  regionBadge: {
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  regionText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  startTime: {
    fontSize: 12,
    color: '#FF5733',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
});