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
  { id: 'Faculty Persona', label: 'Faculty / Professor', icon: 'briefcase', color: Tokens.colors.primary, badge: 'Teaching Staff' },
  { id: 'Warden Persona', label: 'Hostel Warden', icon: 'business', color: Tokens.colors.primary, badge: 'Hostel Admin' },
  { id: 'Parent Persona', label: 'Parent / Guardian', icon: 'people', color: Tokens.colors.primary, badge: 'Guardian' },
  { id: 'System Admin', label: 'System Administrator', icon: 'settings', color: Tokens.colors.primary, badge: 'Super Admin' },
];

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  visible,
  currentRole,
  onSelectRole,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surface;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.border;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textPrimary;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: textPrimary }]}>Switch Operational Role</Text>
              <Text style={styles.sub}>Select your active workspace persona.</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={Tokens.colors.textMuted} />
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
                    isSelected
                      ? { backgroundColor: Tokens.colors.primary, borderColor: Tokens.colors.primary }
                      : { backgroundColor: Tokens.colors.surfaceSoftLight, borderColor: border },
                  ]}
                  onPress={() => onSelectRole(r.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: isSelected ? '#FFFFFF' : Tokens.colors.primary }]}>
                    <Ionicons name={r.icon as any} size={16} color={isSelected ? Tokens.colors.primary : '#FFFFFF'} />
                  </View>
                  <View style={styles.roleInfo}>
                    <Text style={[styles.roleName, { color: isSelected ? '#FFFFFF' : textPrimary }]}>{r.label}</Text>
                    <Text style={[styles.roleBadge, { color: isSelected ? 'rgba(255,255,255,0.8)' : Tokens.colors.textSecondary }]}>{r.badge}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
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
    backgroundColor: 'rgba(10,10,12,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Tokens.spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Tokens.radii.xl, // 12px card radius per Genesis
    padding: Tokens.spacing.lg,
    borderWidth: Tokens.borderWidths.thin,
    borderColor: Tokens.colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Tokens.spacing.md },
  title: { fontSize: 18, fontWeight: '700', letterSpacing: -0.01 },
  sub: { fontSize: 13, color: Tokens.colors.textSecondary, marginTop: 2 },
  roleList: { gap: Tokens.spacing.xs },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.xs,
    borderRadius: Tokens.radii.md, // 6px button radius per Genesis
    borderWidth: Tokens.borderWidths.thin,
    gap: Tokens.spacing.sm,
  },
  iconCircle: { width: 32, height: 32, borderRadius: Tokens.radii.full, alignItems: 'center', justifyContent: 'center' },
  roleInfo: { flex: 1 },
  roleName: { fontSize: 14, fontWeight: '600' },
  roleBadge: { fontSize: 12, fontWeight: '400' },
});

export default RoleSwitcherModal;
