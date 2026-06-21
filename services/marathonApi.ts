import { MarathonEvent, RunningEvent } from '../types';

const MARATHON_API_URL = 'https://raw.githubusercontent.com/pilyeooong/kr-marathon-schedule/refs/heads/master/marathon_data/latest-marathon-schedule.json';

// 빈 문자열, ":", null, undefined → undefined로 통일
const safeStr = (value: string | undefined | null): string | undefined => {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === ':') return undefined;
  return trimmed;
};

const safeNum = (value: number | undefined | null): number | undefined => {
  if (value == null || isNaN(value)) return undefined;
  return value;
};

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

export const transformMarathonToRunningEvent = (event: MarathonEvent, index: number): RunningEvent => {
  const year = typeof event.year === 'string' ? parseInt(event.year, 10) : event.year;

  return {
    id: `${event.year}-${event.month}-${event.day}-${event.event_name}-${event.location}-${index}`,
    year,
    date: `${event.year}-${event.month.toString().padStart(2, '0')}-${event.day.toString().padStart(2, '0')}`,
    name: event.event_name,
    organizer: Array.isArray(event.organizer) ? event.organizer.join(', ') : '',
    distance: Array.isArray(event.tags) ? event.tags.join(' / ') : '',
    location: safeStr(event.location),
    dayOfWeek: safeStr(event.day_of_week),
    phone: safeStr(event.phone),
    homepage: safeStr(event.homepage),
    email: safeStr(event.email),
    representative: safeStr(event.representative),
    startTime: safeStr(event.start_time),
    region: safeStr(event.region),
    registrationPeriod: safeStr(event.registration_period),
    venueDetail: safeStr(event.venue_detail),
    description: safeStr(event.description),
    latitude: safeNum(event.latitude),
    longitude: safeNum(event.longitude),
    mapAddress: safeStr(event.map_address),
  };
};
