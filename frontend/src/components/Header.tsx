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
  title = 'CAMPUS7 PLATFORM',
  currentRole = 'Student Persona',
  unreadNotificationsCount = 3,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [activeRole, setActiveRole] = useState(currentRole);

  const bg = isDark ? Tokens.colors.surfaceDark : Tokens.colors.canvas;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.hairline;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.ink;

  return (
    <>
      <View style={[styles.headerContainer, { backgroundColor: bg, borderBottomColor: border }]}>
        {/* Brand & Role Pill */}
        <View style={styles.leftSection}>
          <TouchableOpacity style={styles.brandContainer} onPress={() => router.push('/' as any)} activeOpacity={0.8}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>C7</Text>
            </View>
            <Text style={[styles.brandTitle, { color: textPrimary }]}>{title.toUpperCase()}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rolePill}
            onPress={() => setRoleModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle-outline" size={14} color={Tokens.colors.canvas} />
            <Text style={styles.rolePillText}>{activeRole.toUpperCase()}</Text>
            <Ionicons name="chevron-down" size={12} color={Tokens.colors.canvas} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons: Notifications & Profile */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.iconBtnCircular}
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Tokens.spacing.lg,
    borderBottomWidth: Tokens.borderWidths.thin,
  },
  leftSection: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.md },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.xs },
  logoIcon: {
    width: 30,
    height: 30,
    backgroundColor: Tokens.colors.ink,
    borderRadius: Tokens.radii.none, // sharp 0px per design.md
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: Tokens.colors.canvas, fontWeight: '900', fontSize: 13, letterSpacing: -0.5 },
  brandTitle: { fontSize: 15, fontWeight: '900', letterSpacing: 0 },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Tokens.colors.ink,
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: 6,
    borderRadius: Tokens.radii.pill, // 30px pill radius per design.md
  },
  rolePillText: { color: Tokens.colors.canvas, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.xs },
  iconBtnCircular: {
    width: 38,
    height: 38,
    borderRadius: Tokens.radii.full, // 9999px circular icon button
    backgroundColor: Tokens.colors.softCloud,
    borderWidth: Tokens.borderWidths.thin,
    borderColor: Tokens.colors.hairline,
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
    backgroundColor: Tokens.colors.sale,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: Tokens.colors.canvas, fontSize: 9, fontWeight: '900' },
});

export default Header;

