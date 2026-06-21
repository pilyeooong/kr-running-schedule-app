import { RunningEvent } from '../types';

export type SearchSort = 'dateAsc' | 'dateDesc';

export interface SearchOptions {
  /** 이미 날짜가 지난 대회 포함 여부 (기본 false: 지난 대회 제외) */
  includePast?: boolean;
  /** 정렬: 가까운 날짜순(dateAsc) | 먼 날짜순(dateDesc) (기본 dateAsc) */
  sort?: SearchSort;
}

/** 오늘 날짜를 'YYYY-MM-DD'로 (로컬 기준, event.date와 동일 포맷이라 문자열 비교 가능) */
function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 전체 대회를 대상으로 대회명·지역·장소·주최·거리·설명에서 토큰 AND 부분일치 검색.
 * 공백으로 구분된 모든 토큰이 포함된 대회만 반환하며, 옵션으로 지난 대회 제외/정렬을 적용한다.
 */
export function searchEvents(
  events: RunningEvent[],
  query: string,
  options: SearchOptions = {}
): RunningEvent[] {
  const { includePast = false, sort = 'dateAsc' } = options;
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/);

  let matched = events.filter(event => {
    const haystack = [
      event.name,
      event.region,
      event.location,
      event.venueDetail,
      event.organizer,
      event.distance,
      event.description,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return tokens.every(t => haystack.includes(t));
  });

  if (!includePast) {
    const today = todayISO();
    matched = matched.filter(event => event.date >= today);
  }

  matched.sort((a, b) =>
    sort === 'dateAsc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
  );

  return matched;
}
