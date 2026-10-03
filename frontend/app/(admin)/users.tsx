import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Tokens } from '../../src/theme/tokens';

interface ManagedUser {
  id: string;
  userCode: string;
  fullName: string;
  contact: string;
  role: 'student' | 'faculty' | 'warden' | 'parent';
  status: 'registered' | 'active' | 'frozen';
  createdAt: string;
}

export default function AdminUsersScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');

  // Freeze Modal State
  const [targetUser, setTargetUser] = useState<ManagedUser | null>(null);
  const [freezeReason, setFreezeReason] = useState('');

  const [users, setUsers] = useState<ManagedUser[]>([
    {
      id: 'usr-1',
      userCode: 'C7-STU-2024CS089',
      fullName: 'Soham Chakraborty',
      contact: 'soham@campus7.edu • +91 9876543210',
      role: 'student',
      status: 'active',
      createdAt: 'Aug 10, 2024',
    },
    {
      id: 'usr-2',
      userCode: 'C7-FAC-9012',
      fullName: 'Dr. Ananya Roy',
      contact: 'ananya.roy@campus7.edu',
      role: 'faculty',
      status: 'active',
      createdAt: 'Jul 01, 2022',
    },
    {
      id: 'usr-3',
      userCode: 'C7-WRD-004',
      fullName: 'Dr. K. V. Raman',
      contact: 'raman.kv@campus7.edu',
      role: 'warden',
      status: 'active',
      createdAt: 'May 15, 2023',
    },
    {
      id: 'usr-4',
      userCode: 'C7-PAR-8821',
      fullName: 'Suresh Chakraborty',
      contact: 'suresh.c@gmail.com',
      role: 'parent',
      status: 'active',
      createdAt: 'Sep 01, 2024',
    },
    {
      id: 'usr-5',
      userCode: 'PENDING_APPROVAL',
      fullName: 'Vikrant Singh',
      contact: 'vikrant.s@gmail.com',
      role: 'student',
      status: 'registered',
      createdAt: 'Oct 02, 2026',
    },
  ]);

  const roles = ['All', 'student', 'faculty', 'warden', 'parent'];

  const filtered = users.filter((u) => {
    const matchesRole = selectedRoleFilter === 'All' || u.role === selectedRoleFilter;
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.contact.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleToggleFreeze = () => {
    if (!targetUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetUser.id) {
          const nextStatus = u.status === 'frozen' ? 'active' : 'frozen';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    setTargetUser(null);
    setFreezeReason('');
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Search Input */}
      <View style={[styles.searchInputWrapper, { backgroundColor: surface, borderColor: border }]}>
        <Ionicons name="search" size={18} color={Tokens.colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: textPrimary }]}
          placeholder="Search by Name, User Code, or Email..."
          placeholderTextColor={Tokens.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Role Filters Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 38, marginBottom: 10 }}>
        {roles.map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.roleChip,
              { backgroundColor: selectedRoleFilter === r ? Tokens.colors.primary : surface, borderColor: border },
            ]}
            onPress={() => setSelectedRoleFilter(r)}
          >
            <Text style={[styles.roleChipText, selectedRoleFilter === r && { color: '#FFF', fontWeight: 'bold' }]}>
              {r.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* User Directory List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        renderItem={({ item }) => (
          <View style={[styles.userCard, { backgroundColor: surface, borderColor: item.status === 'frozen' ? Tokens.colors.accentRed : border }]}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.codeText}>{item.userCode}</Text>
                <Text style={[styles.userName, { color: textPrimary }]}>{item.fullName}</Text>
                <Text style={styles.userContact}>{item.contact}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      item.status === 'active'
                        ? Tokens.colors.secondary
                        : item.status === 'registered'
                        ? Tokens.colors.accentOrange
                        : Tokens.colors.accentRed,
                  },
                ]}
              >
                <Text style={styles.statusBadgeText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.roleText}>Role: {item.role.toUpperCase()} • Member since {item.createdAt}</Text>

              <TouchableOpacity
                style={[
                  styles.freezeBtn,
                  { backgroundColor: item.status === 'frozen' ? Tokens.colors.secondary : Tokens.colors.accentRed },
                ]}
                onPress={() => setTargetUser(item)}
              >
                <Text style={styles.freezeBtnText}>
                  {item.status === 'frozen' ? 'Unfreeze Account' : 'Freeze Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Freeze / Unfreeze Action Modal */}
      <Modal visible={!!targetUser} animationType="fade" transparent onRequestClose={() => setTargetUser(null)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>
              {targetUser?.status === 'frozen' ? 'Unfreeze User Account' : 'Freeze User Account'}
            </Text>

            <Text style={{ fontSize: 12, color: Tokens.colors.textMuted, marginTop: 4 }}>
              Target User: {targetUser?.fullName} ({targetUser?.userCode})
            </Text>

            <Text style={styles.inputLabel}>Mandatory Governance & Audit Reason</Text>
            <TextInput
              style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border, height: 60 }]}
              placeholder="e.g. Disciplinary suspension / Account security breach"
              placeholderTextColor={Tokens.colors.textMuted}
              multiline
              value={freezeReason}
              onChangeText={setFreezeReason}
            />

            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: targetUser?.status === 'frozen' ? Tokens.colors.secondary : Tokens.colors.accentRed },
              ]}
              onPress={handleToggleFreeze}
            >
              <Text style={styles.submitBtnText}>
                Confirm {targetUser?.status === 'frozen' ? 'Unfreeze' : 'Account Freeze'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setTargetUser(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderWidth: 2, borderRadius: 8, height: 44, marginBottom: 10 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13 },
  roleChip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 2, borderRadius: 20, marginRight: 6 },
  roleChipText: { fontSize: 10, color: Tokens.colors.textMuted, fontWeight: '600' },
  scrollContent: { paddingBottom: 20 },
  userCard: { padding: 14, borderWidth: 2, borderRadius: 8, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  codeText: { fontSize: 10, fontWeight: 'bold', color: Tokens.colors.primary, fontFamily: 'monospace' },
  userName: { fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  userContact: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusBadgeText: { fontSize: 9, fontWeight: 'bold', color: '#FFFFFF' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  roleText: { fontSize: 11, color: Tokens.colors.textMuted },
  freezeBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  freezeBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', padding: 18, borderWidth: 2, borderRadius: 8 },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  inputLabel: { fontSize: 12, fontWeight: 'bold', marginTop: 12, color: Tokens.colors.textMuted },
  modalInput: { borderWidth: 1, borderRadius: 6, padding: 10, fontSize: 13, marginTop: 6 },
  submitBtn: { paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 14 },
  submitBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { paddingVertical: 10, alignItems: 'center', marginTop: 6 },
  cancelBtnText: { color: Tokens.colors.textMuted, fontSize: 12 },
});
