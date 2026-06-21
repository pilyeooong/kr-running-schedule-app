export const REGION_ORDER = [
  '서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주', '기타',
];

/** Sort region names by the canonical REGION_ORDER (unknown regions go last). */
export function sortByRegionOrder(regions: string[]): string[] {
  return [...regions].sort((a, b) => {
    const ia = REGION_ORDER.indexOf(a);
    const ib = REGION_ORDER.indexOf(b);
    return (ia === -1 ? REGION_ORDER.length : ia) - (ib === -1 ? REGION_ORDER.length : ib);
  });
}
