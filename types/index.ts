export interface MarathonEvent {
  year: number;
  date: string;
  month: number;
  day: number;
  day_of_week: string;
  event_name: string;
  tags: string[];
  location: string;
  organizer: string[];
  phone: string;
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
}

// 리스트 아이템 타입 (이벤트 또는 광고)
export type ListItem =
  | { type: 'event'; data: RunningEvent }
  | { type: 'ad'; id: string };