export type RegistrationStatus = 'open' | 'upcoming' | 'closed' | 'unknown';

/** Statuses shown in the filter UI (upcoming excluded - too ambiguous as filter) */
export type FilterableStatus = 'open' | 'closed';
export const FILTERABLE_STATUSES: FilterableStatus[] = ['open', 'closed'];

/**
 * Parse Korean date format: "2024년10월10일~2025년1월10일"
 */
function parseRegistrationPeriod(period: string): { start: Date; end: Date } | null {
  const match = period.match(
    /(\d{4})년(\d{1,2})월(\d{1,2})일\s*~\s*(\d{4})년(\d{1,2})월(\d{1,2})일/
  );
  if (!match) return null;
  const [, sy, sm, sd, ey, em, ed] = match;
  return {
    start: new Date(+sy, +sm - 1, +sd),
    end: new Date(+ey, +em - 1, +ed, 23, 59, 59),
  };
}

/**
 * Parse registration period and return start/end dates.
 */
export function parseRegistrationDates(period: string | undefined): { start: Date; end: Date } | null {
  if (!period) return null;
  return parseRegistrationPeriod(period);
}

export function getRegistrationStatus(period: string | undefined): RegistrationStatus {
  if (!period) return 'unknown';
  const parsed = parseRegistrationPeriod(period);
  if (!parsed) return 'unknown';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (today >= parsed.start && today <= parsed.end) return 'open';
  if (today < parsed.start) return 'upcoming';
  return 'closed';
}

export const STATUS_LABELS: Record<RegistrationStatus, string> = {
  open: '접수중',
  upcoming: '접수 전',
  closed: '접수마감',
  unknown: '미정',
};

export const STATUS_COLORS: Record<RegistrationStatus, { bg: string; text: string }> = {
  open: { bg: '#E8F5E9', text: '#2E7D32' },
  upcoming: { bg: '#E3F2FD', text: '#1565C0' },
  closed: { bg: '#F5F5F5', text: '#9E9E9E' },
  unknown: { bg: '#F5F5F5', text: '#9E9E9E' },
};
