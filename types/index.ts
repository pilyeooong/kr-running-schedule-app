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
  date: string;
  name: string;
  organizer: string;
  distance: string;
  location?: string;
  dayOfWeek?: string;
  phone?: string;
}