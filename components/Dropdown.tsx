import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface DropdownOption<T> {
  label: string;
  value: T;
}

interface DropdownProps<T> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
}

/** 재사용 가능한 앵커 팝오버 드롭다운. 필터바에 그대로 끼워 확장할 수 있다. */
export function Dropdown<T extends string | number>({ value, options, onChange }: DropdownProps<T>) {
  const anchorRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, height: 0 });

  const current = options.find(o => o.value === value);

  const openMenu = useCallback(() => {
    anchorRef.current?.measureInWindow((x, y, _w, height) => {
      setAnchor({ x, y, height });
      setOpen(true);
    });
  }, []);

  return (
    <View ref={anchorRef} collapsable={false}>
      <TouchableOpacity
        style={styles.trigger}
        onPress={openMenu}
        accessibilityRole="button"
        accessibilityLabel={`정렬: ${current?.label ?? ''}`}
      >
        <Text style={styles.triggerText}>{current?.label}</Text>
        <Ionicons name="chevron-down" size={14} color="#666666" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.menu, { top: anchor.y + anchor.height + 4, left: anchor.x }]}>
            {options.map(option => {
              const selected = option.value === value;
              return (
                <TouchableOpacity
                  key={String(option.value)}
                  style={styles.menuItem}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.menuItemText, selected && styles.menuItemTextActive]}>
                    {option.label}
                  </Text>
                  {selected && <Ionicons name="checkmark" size={16} color="#FF5733" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 4,
  },
  triggerText: {
    fontSize: 12,
    color: '#444444',
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  menuItemText: {
    fontSize: 13,
    color: '#444444',
  },
  menuItemTextActive: {
    color: '#FF5733',
    fontWeight: '700',
  },
});
