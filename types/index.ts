export interface MarathonEvent {
  year: number | string;
  date: string;
  month: number;
  day: number;
  day_of_week: string;
  event_name: string;
  tags: string[];
  location: string;
  organizer: string[];
  phone: string;
  event_id?: string;
  homepage?: string;
  email?: string;
  representative?: string;
  start_time?: string;
  region?: string;
  registration_period?: string;
  venue_detail?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  map_address?: string;
}

export interface RunningEvent {
  id: string;
  year: number;
  date: string;
  name: string;
  organizer: string;
  distance: string;
  location?: string;
  dayOfWeek?: string;
  phone?: string;
  homepage?: string;
  email?: string;
  representative?: string;
  startTime?: string;
  region?: string;
  registrationPeriod?: string;
  venueDetail?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  mapAddress?: string;
}

// 리스트 아이템 타입 (이벤트 또는 광고)
export type ListItem =
  | { type: 'event'; data: RunningEvent }
  | { type: 'ad'; id: string };