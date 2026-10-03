import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Tokens } from '../theme/tokens';
import { RoleSwitcherModal } from './RoleSwitcherModal';

interface HeaderProps {
  title?: string;
  currentRole?: string;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Campus7 Platform',
  currentRole = 'Student Persona',
  unreadNotificationsCount = 3,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [activeRole, setActiveRole] = useState(currentRole);

  const bg = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  return (
    <>
      <View style={[styles.headerContainer, { backgroundColor: bg, borderColor: border }]}>
        {/* Brand & Role Pill */}
        <View style={styles.leftSection}>
          <TouchableOpacity style={styles.brandContainer} onPress={() => router.push('/' as any)}>
            <View style={[styles.logoIcon, { backgroundColor: Tokens.colors.primary }]}>
              <Text style={styles.logoText}>C7</Text>
            </View>
            <Text style={[styles.brandTitle, { color: textPrimary }]}>{title}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rolePill, { backgroundColor: Tokens.colors.primary }]}
            onPress={() => setRoleModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle-outline" size={14} color="#FFFFFF" />
            <Text style={styles.rolePillText}>{activeRole}</Text>
            <Ionicons name="chevron-down" size={12} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons: Notifications & Dark Mode Indicator */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={[styles.iconBtn, { borderColor: border }]}
            onPress={() => router.push('/notifications' as any)}
          >
            <Ionicons name="notifications-outline" size={18} color={textPrimary} />
            {unreadNotificationsCount > 0 && (
              <View style={[styles.badge, { backgroundColor: Tokens.colors.accentRed }]}>
                <Text style={styles.badgeText}>{unreadNotificationsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <RoleSwitcherModal
        visible={roleModalVisible}
        currentRole={activeRole}
        onSelectRole={(r) => { setActiveRole(r); setRoleModalVisible(false); }}
        onClose={() => setRoleModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Tokens.spacing.md,
    borderBottomWidth: Tokens.borderWidths.flat,
  },
  leftSection: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.sm },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.xs },
  logoIcon: { width: 28, height: 28, borderRadius: Tokens.radii.sm, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  brandTitle: { fontSize: 16, fontWeight: '900' },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: Tokens.radii.pill,
  },
  rolePillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.xs },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: Tokens.radii.sm,
    borderWidth: Tokens.borderWidths.flat,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
});
