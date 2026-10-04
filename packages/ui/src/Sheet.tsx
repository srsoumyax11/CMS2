import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextStyle } from 'react-native';
import { colors, spacing, radius, typography, layout } from '@campus/design-tokens';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ visible, onClose, title, children }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
        accessibilityLabel="Close sheet"
      >
        <TouchableOpacity activeOpacity={1} style={styles.sheetContainer}>
          <View style={styles.dragHandle} />
          {title ? (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={styles.content}>{children}</View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['2xl'],
    maxHeight: '80%',
  },
  dragHandle: {
    width: spacing.xl + spacing.xs,
    height: spacing.xs,
    backgroundColor: colors.gray[300],
    borderRadius: radius.full,
    alignSelf: 'center',
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as TextStyle['fontWeight'],
    color: colors.gray[900],
  },
  closeButton: {
    minWidth: layout.touchTarget.minWidth,
    minHeight: layout.touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[500],
  },
  content: {
    paddingTop: spacing.md,
  },
});
