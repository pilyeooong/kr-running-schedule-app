import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking } from 'react-native';

interface ForceUpdateModalProps {
  visible: boolean;
  storeUrl: string;
  message?: string;
}

export const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({
  visible,
  storeUrl,
  message,
}) => {
  const handleUpdate = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.icon}>🔄</Text>
          <Text style={styles.title}>업데이트가 필요합니다</Text>
          <Text style={styles.message}>
            {message || '더 나은 서비스를 위해 최신 버전으로 업데이트해 주세요.'}
          </Text>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdate}
            accessibilityRole="button"
            accessibilityLabel="업데이트하기"
          >
            <Text style={styles.updateButtonText}>업데이트하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  updateButton: {
    backgroundColor: '#FF5733',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
