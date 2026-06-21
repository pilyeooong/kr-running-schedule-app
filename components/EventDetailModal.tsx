import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
} from 'react-native';
import { RunningEvent } from '../types';

interface EventDetailModalProps {
  event: RunningEvent | null;
  visible: boolean;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  visible,
  onClose,
}) => {
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();
    } else {
      translateY.setValue(50);
    }
  }, [visible]);

  if (!event) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleOpenURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch {
      // URL을 열 수 없는 경우 무시
    }
  };

  const handleOpenMap = () => {
    if (event.latitude != null && event.longitude != null) {
      const label = encodeURIComponent(event.location || event.name);
      const url = `https://maps.apple.com/?ll=${event.latitude},${event.longitude}&q=${label}`;
      handleOpenURL(url);
    } else if (event.mapAddress) {
      const url = `https://maps.apple.com/?q=${encodeURIComponent(event.mapAddress)}`;
      handleOpenURL(url);
    }
  };

  const handleCall = (phone: string) => {
    const cleaned = phone.replace(/[^0-9-+]/g, '');
    if (cleaned) {
      handleOpenURL(`tel:${cleaned}`);
    }
  };

  const handleEmail = (email: string) => {
    handleOpenURL(`mailto:${email}`);
  };

  const hasMapInfo = (event.latitude != null && event.longitude != null) || !!event.mapAddress;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.grabIndicator} />
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="닫기"
          >
            <Text style={styles.closeText}>닫기</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ transform: [{ translateY }] }}>
            {/* 대회명 */}
            <Text style={styles.eventName}>{event.name}</Text>

            {/* 날짜/시간 영역 */}
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>날짜</Text>
                <Text style={styles.value}>
                  {formatDate(event.date)}
                  {event.dayOfWeek ? ` (${event.dayOfWeek})` : ''}
                </Text>
              </View>
              {event.startTime && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>출발 시간</Text>
                  <Text style={styles.value}>{event.startTime}</Text>
                </View>
              )}
              {event.distance ? (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>코스</Text>
                  <Text style={[styles.value, styles.distanceText]}>{event.distance}</Text>
                </View>
              ) : null}
            </View>

            {/* 장소 영역 */}
            {(event.location || event.venueDetail || event.mapAddress) && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>장소</Text>
                {event.location && (
                  <Text style={styles.locationText}>{event.location}</Text>
                )}
                {event.venueDetail && (
                  <Text style={styles.subText}>{event.venueDetail}</Text>
                )}
                {event.mapAddress && (
                  <Text style={styles.subText}>{event.mapAddress}</Text>
                )}
                {hasMapInfo && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleOpenMap}
                    accessibilityRole="button"
                    accessibilityLabel="지도에서 보기"
                  >
                    <Text style={styles.actionButtonText}>지도에서 보기</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* 지역 뱃지 */}
            {event.region && (
              <View style={styles.card}>
                <View style={[styles.infoRow, styles.infoRowCenter]}>
                  <Text style={styles.label}>지역</Text>
                  <View style={styles.regionBadge}>
                    <Text style={styles.regionText}>{event.region}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 대회 설명 */}
            {event.description && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>대회 소개</Text>
                <Text style={styles.descriptionText}>{event.description}</Text>
              </View>
            )}

            {/* 접수 기간 */}
            {event.registrationPeriod && (
              <View style={styles.card}>
                <View style={[styles.infoRow, styles.infoRowCenter]}>
                  <Text style={styles.label}>접수 기간</Text>
                  <Text style={styles.value}>{event.registrationPeriod}</Text>
                </View>
              </View>
            )}

            {/* 주최/연락처 */}
            {(event.organizer || event.representative || event.phone || event.email) && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>주최 / 연락처</Text>
                {event.organizer ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>주최</Text>
                    <Text style={styles.value}>{event.organizer}</Text>
                  </View>
                ) : null}
                {event.representative && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>대표</Text>
                    <Text style={styles.value}>{event.representative}</Text>
                  </View>
                )}
                {event.phone && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>전화</Text>
                    <TouchableOpacity onPress={() => handleCall(event.phone!)}>
                      <Text style={[styles.value, styles.linkText]}>{event.phone}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {event.email && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>이메일</Text>
                    <TouchableOpacity onPress={() => handleEmail(event.email!)}>
                      <Text style={[styles.value, styles.linkText]}>{event.email}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* 홈페이지 */}
            {event.homepage && (
              <TouchableOpacity
                style={styles.homepageButton}
                onPress={() => handleOpenURL(event.homepage!)}
                accessibilityRole="button"
                accessibilityLabel="홈페이지 바로가기"
              >
                <Text style={styles.homepageButtonText}>홈페이지 바로가기</Text>
              </TouchableOpacity>
            )}

            <View style={{ height: 40 }} />
          </Animated.View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  grabIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D1D1',
    marginBottom: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  closeText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 8,
  },
  eventName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    lineHeight: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoRowCenter: {
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#767676',
    width: 70,
    flexShrink: 0,
  },
  value: {
    fontSize: 14,
    color: '#1A1A1A',
    flex: 1,
  },
  distanceText: {
    color: '#FF5733',
    fontWeight: '600',
  },
  locationText: {
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subText: {
    fontSize: 13,
    color: '#767676',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  regionBadge: {
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  regionText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  linkText: {
    color: '#FF5733',
    textDecorationLine: 'underline',
  },
  actionButton: {
    marginTop: 12,
    backgroundColor: '#F2F2F2',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '600',
  },
  homepageButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  homepageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
