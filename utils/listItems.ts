import { RunningEvent, ListItem } from '../types';

/** 광고를 일정 간격으로 삽입. 위치/키가 이벤트 id 기반으로 결정적이라 필터 전환 시 불필요한 remount가 없다. */
const AD_INTERVAL = 7;

export function insertAds(events: RunningEvent[], prefix: string): ListItem[] {
  const items: ListItem[] = [];
  events.forEach((event, index) => {
    items.push({ type: 'event', data: event });
    if ((index + 1) % AD_INTERVAL === 0 && index < events.length - 1) {
      items.push({ type: 'ad', id: `${prefix}-ad-${event.id}` });
    }
  });
  return items;
}
