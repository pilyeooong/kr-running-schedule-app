import { Platform } from 'react-native';

const VERSION_CHECK_URL =
  'https://raw.githubusercontent.com/pilyeooong/kr-marathon-schedule/refs/heads/master/app-config/version-check.json';

interface VersionCheckResponse {
  minVersion: string;
  latestVersion: string;
  forceUpdate: boolean;
  storeUrl: {
    ios: string;
    android: string;
  };
  message?: string;
}

/**
 * Compare semver strings. Returns:
 *  -1 if a < b
 *   0 if a === b
 *   1 if a > b
 */
function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na < nb) return -1;
    if (na > nb) return 1;
  }
  return 0;
}

export interface UpdateCheckResult {
  needsUpdate: boolean;
  storeUrl: string;
  message?: string;
}

export async function checkForUpdate(currentVersion: string): Promise<UpdateCheckResult | null> {
  try {
    const response = await fetch(VERSION_CHECK_URL, { cache: 'no-store' });
    if (!response.ok) return null;

    const data: VersionCheckResponse = await response.json();

    if (!data.forceUpdate) return null;

    const needsUpdate = compareSemver(currentVersion, data.minVersion) < 0;
    const storeUrl = Platform.OS === 'ios' ? data.storeUrl.ios : data.storeUrl.android;

    return {
      needsUpdate,
      storeUrl,
      message: data.message,
    };
  } catch {
    // 버전 체크 실패 시 앱 사용을 막지 않음
    return null;
  }
}
