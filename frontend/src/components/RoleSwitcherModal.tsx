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
  { id: 'Student Persona', label: 'STUDENT PERSONA', icon: 'school', color: Tokens.colors.ink, badge: 'Active Student' },
  { id: 'Faculty Persona', label: 'FACULTY / PROFESSOR', icon: 'briefcase', color: Tokens.colors.ink, badge: 'Teaching Staff' },
  { id: 'Warden Persona', label: 'HOSTEL WARDEN', icon: 'business', color: Tokens.colors.ink, badge: 'Hostel Admin' },
  { id: 'Parent Persona', label: 'PARENT / GUARDIAN', icon: 'people', color: Tokens.colors.ink, badge: 'Guardian' },
  { id: 'System Admin', label: 'SYSTEM ADMINISTRATOR', icon: 'settings', color: Tokens.colors.ink, badge: 'Super Admin' },
];

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  visible,
  currentRole,
  onSelectRole,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.canvas;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.hairline;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.ink;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: textPrimary }]}>SELECT OPERATIONAL ROLE</Text>
              <Text style={styles.sub}>Choose your active persona for this session.</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={textPrimary} />
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
                      ? { backgroundColor: Tokens.colors.ink, borderColor: Tokens.colors.ink }
                      : { backgroundColor: Tokens.colors.softCloud, borderColor: border },
                  ]}
                  onPress={() => onSelectRole(r.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: isSelected ? Tokens.colors.canvas : Tokens.colors.ink }]}>
                    <Ionicons name={r.icon as any} size={16} color={isSelected ? Tokens.colors.ink : Tokens.colors.canvas} />
                  </View>
                  <View style={styles.roleInfo}>
                    <Text style={[styles.roleName, { color: isSelected ? Tokens.colors.canvas : textPrimary }]}>{r.label}</Text>
                    <Text style={[styles.roleBadge, { color: isSelected ? Tokens.colors.hairline : Tokens.colors.mute }]}>{r.badge}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color={Tokens.colors.canvas} />
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
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Tokens.spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: Tokens.radii.none, // Flat 0px per design.md
    padding: Tokens.spacing.lg,
    borderWidth: Tokens.borderWidths.thin,
    borderColor: Tokens.colors.hairline,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Tokens.spacing.md },
  title: { fontSize: 16, fontWeight: '900', letterSpacing: 0 },
  sub: { fontSize: 12, color: Tokens.colors.mute, marginTop: 2 },
  roleList: { gap: Tokens.spacing.sm },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.radii.pill, // Pill CTAs
    borderWidth: Tokens.borderWidths.thin,
    gap: Tokens.spacing.sm,
  },
  iconCircle: { width: 32, height: 32, borderRadius: Tokens.radii.full, alignItems: 'center', justifyContent: 'center' },
  roleInfo: { flex: 1 },
  roleName: { fontSize: 13, fontWeight: '800' },
  roleBadge: { fontSize: 11, fontWeight: '500' },
});

export default RoleSwitcherModal;

