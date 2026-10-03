import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Tokens } from '../theme/tokens';

interface RoleSwitcherModalProps {
  visible: boolean;
  currentRole: string;
  onSelectRole: (role: string) => void;
  onClose: () => void;
}

const AVAILABLE_ROLES = [
  { id: 'Student Persona', label: 'Student Persona', icon: 'school', color: Tokens.colors.primary, badge: 'Active Student' },
  { id: 'Faculty Persona', label: 'Faculty / Professor', icon: 'briefcase', color: Tokens.colors.secondary, badge: 'Teaching Staff' },
  { id: 'Warden Persona', label: 'Hostel Warden', icon: 'business', color: Tokens.colors.accentOrange, badge: 'Hostel Admin' },
  { id: 'Parent Persona', label: 'Parent / Guardian', icon: 'people', color: Tokens.colors.accentPurple, badge: 'Guardian' },
  { id: 'System Admin', label: 'System Administrator', icon: 'settings', color: Tokens.colors.accentRed, badge: 'Super Admin' },
];

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  visible,
  currentRole,
  onSelectRole,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: textPrimary }]}>Switch Operational Role</Text>
              <Text style={styles.sub}>Select your active persona for this session.</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={24} color={Tokens.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.roleList}>
            {AVAILABLE_ROLES.map((r) => {
              const isSelected = currentRole === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.roleItem,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : Tokens.colors.bgLight,
                      borderColor: isSelected ? r.color : border,
                      borderWidth: isSelected ? Tokens.borderWidths.flat : Tokens.borderWidths.thin,
                    },
                  ]}
                  onPress={() => onSelectRole(r.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: r.color }]}>
                    <Ionicons name={r.icon as any} size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.roleInfo}>
                    <Text style={[styles.roleName, { color: textPrimary }]}>{r.label}</Text>
                    <Text style={styles.roleBadge}>{r.badge}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={r.color} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Tokens.spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Tokens.radii.lg,
    padding: Tokens.spacing.lg,
    borderWidth: Tokens.borderWidths.flat,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Tokens.spacing.md },
  title: { fontSize: 18, fontWeight: '900' },
  sub: { fontSize: 12, color: Tokens.colors.textMuted },
  roleList: { gap: Tokens.spacing.sm },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Tokens.spacing.sm,
    borderRadius: Tokens.radii.md,
    gap: Tokens.spacing.sm,
  },
  iconCircle: { width: 36, height: 36, borderRadius: Tokens.radii.sm, alignItems: 'center', justifyContent: 'center' },
  roleInfo: { flex: 1 },
  roleName: { fontSize: 14, fontWeight: '800' },
  roleBadge: { fontSize: 11, color: Tokens.colors.textMuted },
});
