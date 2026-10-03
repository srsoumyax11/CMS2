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

  const bg = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surface;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.border;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textPrimary;

  return (
    <>
      <View style={[styles.headerContainer, { backgroundColor: bg, borderBottomColor: border }]}>
        {/* Brand & Role Switcher */}
        <View style={styles.leftSection}>
          <TouchableOpacity style={styles.brandContainer} onPress={() => router.push('/' as any)} activeOpacity={0.8}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>C7</Text>
            </View>
            <Text style={[styles.brandTitle, { color: textPrimary }]}>{title}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => setRoleModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle-outline" size={14} color="#FFFFFF" />
            <Text style={styles.roleButtonText}>{activeRole}</Text>
            <Ionicons name="chevron-down" size={12} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Notification Icon Button */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={[styles.iconButton, { borderColor: border }]}
            onPress={() => router.push('/notifications' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={18} color={textPrimary} />
            {unreadNotificationsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadNotificationsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <RoleSwitcherModal
        visible={roleModalVisible}
        currentRole={activeRole}
        onSelectRole={(r: string) => { setActiveRole(r); setRoleModalVisible(false); }}
        onClose={() => setRoleModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 56, // Genesis spec: 56px height nav bar
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Tokens.spacing.md,
    borderBottomWidth: Tokens.borderWidths.thin,
  },
  leftSection: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.sm },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.xs },
  logoBadge: {
    width: 28,
    height: 28,
    backgroundColor: Tokens.colors.primary, // #6366F1 Indigo
    borderRadius: Tokens.radii.md, // 6px radius per Genesis
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  brandTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.02 },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Tokens.colors.primary, // #6366F1 Indigo Primary Button
    paddingHorizontal: Tokens.spacing.sm,
    paddingVertical: 6,
    borderRadius: Tokens.radii.md, // 6px radius per Genesis buttons
  },
  roleButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.xs },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: Tokens.radii.full, // Avatars & status circular elements
    backgroundColor: Tokens.colors.surfaceSoftLight,
    borderWidth: Tokens.borderWidths.thin,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: Tokens.radii.full,
    backgroundColor: Tokens.colors.error, // Semantic error red
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
});

export default Header;
