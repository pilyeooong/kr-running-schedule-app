import { MarathonEvent } from '../types';

const MARATHON_API_URL = 'https://raw.githubusercontent.com/pilyeooong/kr-marathon-schedule/refs/heads/master/marathon_data/latest-marathon-schedule.json';

export const fetchMarathonEvents = async (): Promise<MarathonEvent[]> => {
  try {
    const response = await fetch(MARATHON_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch marathon events');
    }
    const data: MarathonEvent[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching marathon events:', error);
    throw error;
  }
};

export const transformMarathonToRunningEvent = (event: MarathonEvent) => ({
  id: `${event.year}-${event.month}-${event.day}-${event.event_name}`,
  date: `${event.year}-${event.month.toString().padStart(2, '0')}-${event.day.toString().padStart(2, '0')}`,
  name: event.event_name,
  organizer: event.organizer.join(', '),
  distance: event.tags.join(' / '),
  location: event.location,
  dayOfWeek: event.day_of_week,
  phone: event.phone,
});