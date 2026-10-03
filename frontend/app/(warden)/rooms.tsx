import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
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

interface Room {
  roomNo: string;
  floor: number;
  totalBeds: number;
  occupiedBeds: number;
  occupants: string[];
  status: 'Occupied' | 'Available' | 'Maintenance';
}

export default function WardenRoomsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Allocation Modal State
  const [allocModalVisible, setAllocModalVisible] = useState(false);
  const [studentRoll, setStudentRoll] = useState('');
  const [allocatedSuccess, setAllocatedSuccess] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([
    { roomNo: '101', floor: 1, totalBeds: 2, occupiedBeds: 2, occupants: ['Aditya V.', 'Rohan M.'], status: 'Occupied' },
    { roomNo: '102', floor: 1, totalBeds: 2, occupiedBeds: 1, occupants: ['Vikrant S.'], status: 'Available' },
    { roomNo: '103', floor: 1, totalBeds: 2, occupiedBeds: 0, occupants: [], status: 'Available' },
    { roomNo: '104', floor: 1, totalBeds: 2, occupiedBeds: 0, occupants: [], status: 'Maintenance' },

    { roomNo: '201', floor: 2, totalBeds: 2, occupiedBeds: 2, occupants: ['Karan M.', 'Soham C.'], status: 'Occupied' },
    { roomNo: '202', floor: 2, totalBeds: 2, occupiedBeds: 1, occupants: ['Aman V.'], status: 'Available' },
    { roomNo: '203', floor: 2, totalBeds: 2, occupiedBeds: 0, occupants: [], status: 'Available' },
  ]);

  const filteredRooms = rooms.filter((r) => r.floor === selectedFloor);

  const handleAllocate = () => {
    if (!studentRoll.trim() || !selectedRoom) return;
    setRooms((prev) =>
      prev.map((r) => {
        if (r.roomNo === selectedRoom.roomNo) {
          const newOccupied = r.occupiedBeds + 1;
          return {
            ...r,
            occupiedBeds: newOccupied,
            occupants: [...r.occupants, studentRoll.toUpperCase()],
            status: newOccupied === r.totalBeds ? 'Occupied' : 'Available',
          };
        }
        return r;
      })
    );
    setAllocatedSuccess(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Floor Selection Tabs */}
      <View style={styles.tabsRow}>
        {[1, 2, 3].map((fl) => (
          <TouchableOpacity
            key={fl}
            style={[styles.tabBtn, selectedFloor === fl && { backgroundColor: Tokens.colors.primary }]}
            onPress={() => setSelectedFloor(fl)}
          >
            <Text style={[styles.tabText, selectedFloor === fl && styles.tabTextActive]}>Floor {fl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Block B — Floor {selectedFloor} Room Layout</Text>

        <View style={styles.grid}>
          {filteredRooms.map((r) => {
            const isFull = r.occupiedBeds === r.totalBeds;
            const isMaint = r.status === 'Maintenance';
            return (
              <View
                key={r.roomNo}
                style={[
                  styles.roomCard,
                  {
                    backgroundColor: surface,
                    borderColor: isMaint ? Tokens.colors.accentOrange : isFull ? border : Tokens.colors.secondary,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.roomNo, { color: textPrimary }]}>Room {r.roomNo}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isMaint
                          ? Tokens.colors.accentOrange
                          : isFull
                          ? Tokens.colors.borderDark
                          : Tokens.colors.secondary,
                      },
                    ]}
                  >
                    <Text style={styles.statusPillText}>
                      {isMaint ? 'Maint' : `${r.occupiedBeds}/${r.totalBeds} Beds`}
                    </Text>
                  </View>
                </View>

                <View style={{ marginVertical: 8 }}>
                  {r.occupants.length > 0 ? (
                    r.occupants.map((occ, i) => (
                      <Text key={i} style={styles.occupantText}>• Bed {i + 1}: {occ}</Text>
                    ))
                  ) : (
                    <Text style={[styles.occupantText, { color: Tokens.colors.textMuted }]}>
                      {isMaint ? 'Under Maintenance' : 'Empty Room (2 Vacant Beds)'}
                    </Text>
                  )}
                </View>

                {!isFull && !isMaint && (
                  <TouchableOpacity
                    style={[styles.allocBtn, { backgroundColor: Tokens.colors.primary }]}
                    onPress={() => {
                      setSelectedRoom(r);
                      setStudentRoll('');
                      setAllocatedSuccess(false);
                      setAllocModalVisible(true);
                    }}
                  >
                    <Text style={styles.allocBtnText}>Assign Bed</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bed Allocation Modal */}
      <Modal visible={allocModalVisible} animationType="fade" transparent onRequestClose={() => setAllocModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>
              {allocatedSuccess ? 'Bed Allotment Confirmed! 🎉' : `Assign Bed in Room ${selectedRoom?.roomNo}`}
            </Text>

            {allocatedSuccess ? (
              <View style={{ alignItems: 'center', marginVertical: 14 }}>
                <Ionicons name="checkmark-circle" size={54} color={Tokens.colors.secondary} />
                <Text style={[styles.modalSub, { color: textPrimary, textAlign: 'center', marginTop: 10 }]}>
                  Student <Text style={{ fontWeight: 'bold' }}>{studentRoll.toUpperCase()}</Text> has been allocated Bed B in Room {selectedRoom?.roomNo}.
                </Text>

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: Tokens.colors.primary, marginTop: 16 }]}
                  onPress={() => setAllocModalVisible(false)}
                >
                  <Text style={styles.submitBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.inputLabel}>Student Roll Number / Admission ID</Text>
                <TextInput
                  style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border }]}
                  placeholder="e.g. 2024-CS-099"
                  placeholderTextColor={Tokens.colors.textMuted}
                  value={studentRoll}
                  onChangeText={setStudentRoll}
                />

                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Tokens.colors.primary }]} onPress={handleAllocate}>
                  <Text style={styles.submitBtnText}>Confirm Bed Allocation</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAllocModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  tabsRow: { flexDirection: 'row', marginBottom: 12 },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: Tokens.colors.borderDark,
    borderRadius: 6,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  tabText: { fontSize: 12, fontWeight: '600', color: Tokens.colors.textMuted },
  tabTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  scrollContent: { paddingBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  roomCard: { width: '48%', padding: 12, borderWidth: 2, borderRadius: 8, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomNo: { fontSize: 14, fontWeight: 'bold' },
  statusPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusPillText: { fontSize: 9, fontWeight: 'bold', color: '#FFFFFF' },
  occupantText: { fontSize: 11, color: Tokens.colors.textDark, marginVertical: 1 },
  allocBtn: { paddingVertical: 6, borderRadius: 4, alignItems: 'center', marginTop: 6 },
  allocBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 11 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', padding: 18, borderWidth: 2, borderRadius: 8 },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  modalSub: { fontSize: 13, lineHeight: 18 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', marginTop: 12, color: Tokens.colors.textMuted },
  modalInput: { borderWidth: 1, borderRadius: 6, padding: 10, fontSize: 13, marginTop: 6 },
  submitBtn: { paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 14 },
  submitBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { paddingVertical: 10, alignItems: 'center', marginTop: 6 },
  cancelBtnText: { color: Tokens.colors.textMuted, fontSize: 12 },
});
