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

interface MaintenanceTicket {
  id: string;
  category: 'Electrical' | 'Plumbing' | 'Furniture' | 'Cleaning' | 'Internet';
  title: string;
  dateSubmitted: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
}

export default function HostelScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [activeSection, setActiveSection] = useState<'room' | 'tickets' | 'mess'>('room');

  // Mess Day Toggle
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [selectedDay, setSelectedDay] = useState<string>('Mon');

  // Ticket Form Modal
  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [ticketCategory, setTicketCategory] = useState<'Electrical' | 'Plumbing' | 'Furniture' | 'Cleaning' | 'Internet'>('Electrical');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');

  // Mess Rating Modal
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [messFeedback, setMessFeedback] = useState('');

  // Tickets Data
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([
    {
      id: 'T-1029',
      category: 'Electrical',
      title: 'Ceiling Fan humming noise & speed issue',
      dateSubmitted: 'Sep 28, 2026',
      status: 'In Progress',
      priority: 'Medium',
    },
    {
      id: 'T-1014',
      category: 'Plumbing',
      title: 'Bathroom tap leak in Block B 2nd floor',
      dateSubmitted: 'Sep 12, 2026',
      status: 'Resolved',
      priority: 'Low',
    },
  ]);

  const handleCreateTicket = () => {
    if (!ticketTitle.trim()) return;
    const newT: MaintenanceTicket = {
      id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
      category: ticketCategory,
      title: ticketTitle,
      dateSubmitted: 'Today',
      status: 'Open',
      priority: 'High',
    };
    setTickets([newT, ...tickets]);
    setTicketTitle('');
    setTicketDesc('');
    setTicketModalVisible(false);
  };

  const messMenu: Record<string, { breakfast: string; lunch: string; snacks: string; dinner: string }> = {
    Mon: {
      breakfast: 'Idli Sambhar, Chutney, Bread Jam, Tea/Coffee (Veg)',
      lunch: 'Rajma Chawal, Chapati, Mixed Veg Dry, Boondi Raita (Veg)',
      snacks: 'Samosa, Mint Chutney, Tea (Veg)',
      dinner: 'Kadai Paneer / Chicken Curry, Phulka, Jeera Rice, Gulab Jamun',
    },
    Tue: {
      breakfast: 'Poha, Aloo Bonda, Sprouts, Milk/Tea (Veg)',
      lunch: 'Kadi Pakoda, Steamed Rice, Bhindi Fry, Salad (Veg)',
      snacks: 'Veg Sandwich, Lemonade (Veg)',
      dinner: 'Dal Makhani, Mix Veg, Phulka, Rice, Kheer (Veg)',
    },
    Wed: {
      breakfast: 'Aloo Paratha, Curd, Butter, Tea (Veg)',
      lunch: 'Veg Biryani, Mirchi Ka Salan, Onion Raita (Veg)',
      snacks: 'Pav Bhaji, Tea (Veg)',
      dinner: 'Egg Curry / Paneer Butter Masala, Butter Naan, Rice, Ice Cream',
    },
    Thu: {
      breakfast: 'Upma, Vada, Sambar, Coffee/Tea (Veg)',
      lunch: 'Chole Bhature, Sweet Lassi, Cucumber Salad (Veg)',
      snacks: 'Biscuit & Tea (Veg)',
      dinner: 'Dal Tadka, Sev Tamatar, Chapati, Rice, Halwa (Veg)',
    },
    Fri: {
      breakfast: 'Masala Dosa, Sambar, Coconut Chutney, Milk/Tea (Veg)',
      lunch: 'South Indian Thali, Rasam, Curd Rice, Papad (Veg)',
      snacks: 'Cutlet, Tomato Ketchup, Tea (Veg)',
      dinner: 'Fish Fry / Malai Kofta, Phulka, Peas Pulav, Fruit Custard',
    },
    Sat: {
      breakfast: 'Puri Bhaji, Banana, Tea/Coffee (Veg)',
      lunch: 'Veg Fried Rice, Manchurian Gravy, Fried Papad (Veg)',
      snacks: 'Maggi / Pasta, Cold Coffee (Veg)',
      dinner: 'Paneer Do Pyaza, Phulka, Rice, Moong Dal Halwa (Veg)',
    },
    Sun: {
      breakfast: 'Chole Kulche, Jalebi, Tea/Coffee (Veg)',
      lunch: 'Special Hyderabadi Dum Biryani (Chicken/Paneer), Raita, Salan',
      snacks: 'Mathri, Chai (Veg)',
      dinner: 'Light Khichdi, Papad, Pickle, Fruit (Veg)',
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Top Navigation Chips */}
      <View style={styles.topNavRow}>
        <TouchableOpacity
          style={[styles.navChip, activeSection === 'room' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveSection('room')}
        >
          <Ionicons name="bed-outline" size={16} color={activeSection === 'room' ? '#FFF' : Tokens.colors.textMuted} />
          <Text style={[styles.navChipText, activeSection === 'room' && styles.navChipTextActive]}>Room Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navChip, activeSection === 'tickets' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveSection('tickets')}
        >
          <Ionicons name="build-outline" size={16} color={activeSection === 'tickets' ? '#FFF' : Tokens.colors.textMuted} />
          <Text style={[styles.navChipText, activeSection === 'tickets' && styles.navChipTextActive]}>Maintenance ({tickets.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navChip, activeSection === 'mess' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveSection('mess')}
        >
          <Ionicons name="restaurant-outline" size={16} color={activeSection === 'mess' ? '#FFF' : Tokens.colors.textMuted} />
          <Text style={[styles.navChipText, activeSection === 'mess' && styles.navChipTextActive]}>Mess Menu</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section 1: Room Details */}
        {activeSection === 'room' && (
          <View>
            <View style={[styles.roomCard, { backgroundColor: surface, borderColor: border }]}>
              <View style={styles.roomHeader}>
                <View>
                  <Text style={[styles.roomTitle, { color: textPrimary }]}>Hostel Block B — Room 304</Text>
                  <Text style={styles.roomSub}>Bed ID: B-304-2 • Deluxe Double Occupancy</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: Tokens.colors.secondary }]}>
                  <Text style={styles.badgeText}>Active Resident</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Roommates */}
              <Text style={[styles.subHead, { color: textPrimary }]}>Roommate Information</Text>
              <View style={styles.roommateRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>RS</Text>
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={[styles.nameText, { color: textPrimary }]}>Rahul Sharma</Text>
                  <Text style={styles.subText}>Roll: 2024-CS-044 • Branch: Computer Engineering</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Warden Details */}
              <Text style={[styles.subHead, { color: textPrimary }]}>Assigned Hostel Warden</Text>
              <View style={styles.wardenRow}>
                <Ionicons name="person-circle-outline" size={32} color={Tokens.colors.primary} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={[styles.nameText, { color: textPrimary }]}>Dr. K. V. Raman</Text>
                  <Text style={styles.subText}>Chief Warden Block B • Office: Ground Floor 04</Text>
                </View>
                <TouchableOpacity style={styles.callBtn} onPress={() => alert('Calling Warden Dr. K. V. Raman (+91 9876543210)')}>
                  <Ionicons name="call" size={16} color="#FFFFFF" />
                  <Text style={styles.callBtnText}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Section 2: Maintenance Issues */}
        {activeSection === 'tickets' && (
          <View>
            <TouchableOpacity
              style={[styles.newTicketBtn, { backgroundColor: Tokens.colors.primary }]}
              onPress={() => setTicketModalVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.newTicketBtnText}>Report Room Maintenance Issue</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Submitted Complaints & Tickets</Text>

            {tickets.map((t) => (
              <View key={t.id} style={[styles.ticketCard, { backgroundColor: surface, borderColor: border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ticketId}>{t.id} • {t.category}</Text>
                    <Text style={[styles.ticketTitle, { color: textPrimary }]}>{t.title}</Text>
                    <Text style={styles.ticketDate}>Submitted on {t.dateSubmitted}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          t.status === 'Resolved'
                            ? Tokens.colors.secondary
                            : t.status === 'In Progress'
                            ? Tokens.colors.accentOrange
                            : Tokens.colors.accentRed,
                      },
                    ]}
                  >
                    <Text style={styles.statusPillText}>{t.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Section 3: Mess Menu */}
        {activeSection === 'mess' && (
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={[styles.sectionTitle, { color: textPrimary, marginBottom: 0 }]}>Weekly Hostel Mess Schedule</Text>
              <TouchableOpacity
                style={[styles.rateMessBtn, { backgroundColor: Tokens.colors.accentPurple }]}
                onPress={() => setRatingModalVisible(true)}
              >
                <Ionicons name="star" size={14} color="#FFF" />
                <Text style={styles.rateMessBtnText}>Rate Meal</Text>
              </TouchableOpacity>
            </View>

            {/* Day Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {days.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.dayChip,
                    { backgroundColor: selectedDay === d ? Tokens.colors.primary : surface, borderColor: border },
                  ]}
                  onPress={() => setSelectedDay(d)}
                >
                  <Text style={[styles.dayChipText, selectedDay === d && { color: '#FFFFFF', fontWeight: 'bold' }]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Meal Breakdown Cards */}
            {[
              { title: 'Breakfast (07:30 AM - 09:30 AM)', menu: messMenu[selectedDay]?.breakfast, icon: 'cafe-outline' },
              { title: 'Lunch (12:30 PM - 02:30 PM)', menu: messMenu[selectedDay]?.lunch, icon: 'nutrition-outline' },
              { title: 'Evening Snacks (05:00 PM - 06:00 PM)', menu: messMenu[selectedDay]?.snacks, icon: 'pizza-outline' },
              { title: 'Dinner (08:00 PM - 10:00 PM)', menu: messMenu[selectedDay]?.dinner, icon: 'restaurant-outline' },
            ].map((m, idx) => (
              <View key={idx} style={[styles.mealCard, { backgroundColor: surface, borderColor: border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={m.icon as any} size={20} color={Tokens.colors.primary} />
                  <Text style={[styles.mealTitle, { color: textPrimary, marginLeft: 8 }]}>{m.title}</Text>
                </View>
                <Text style={styles.mealMenuText}>{m.menu}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* New Maintenance Ticket Modal */}
      <Modal visible={ticketModalVisible} animationType="fade" transparent onRequestClose={() => setTicketModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>Log Room Maintenance Issue</Text>

            <Text style={styles.inputLabel}>Select Issue Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 6 }}>
              {(['Electrical', 'Plumbing', 'Furniture', 'Cleaning', 'Internet'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catSelectChip,
                    { backgroundColor: ticketCategory === cat ? Tokens.colors.primary : bg, borderColor: border },
                  ]}
                  onPress={() => setTicketCategory(cat)}
                >
                  <Text style={{ fontSize: 11, color: ticketCategory === cat ? '#FFF' : textPrimary, fontWeight: 'bold' }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Issue Summary</Text>
            <TextInput
              style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border }]}
              placeholder="e.g. Broken study table leg / Fan not working"
              placeholderTextColor={Tokens.colors.textMuted}
              value={ticketTitle}
              onChangeText={setTicketTitle}
            />

            <Text style={styles.inputLabel}>Detailed Description</Text>
            <TextInput
              style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border, height: 70 }]}
              placeholder="Describe exact location or nature of defect..."
              placeholderTextColor={Tokens.colors.textMuted}
              multiline
              value={ticketDesc}
              onChangeText={setTicketDesc}
            />

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Tokens.colors.primary }]} onPress={handleCreateTicket}>
              <Text style={styles.submitBtnText}>Submit Complaint Ticket</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setTicketModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Meal Rating Modal */}
      <Modal visible={ratingModalVisible} animationType="fade" transparent onRequestClose={() => setRatingModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>Rate Today's Mess Meal</Text>
            <Text style={{ fontSize: 12, color: Tokens.colors.textMuted, marginTop: 4 }}>Help improve mess food hygiene and quality</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 16 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setSelectedRating(star)} style={{ padding: 6 }}>
                  <Ionicons
                    name={star <= selectedRating ? 'star' : 'star-outline'}
                    size={32}
                    color={Tokens.colors.accentOrange}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border, height: 60 }]}
              placeholder="Optional meal feedback or suggestion..."
              placeholderTextColor={Tokens.colors.textMuted}
              multiline
              value={messFeedback}
              onChangeText={setMessFeedback}
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: Tokens.colors.secondary }]}
              onPress={() => {
                setRatingModalVisible(false);
                alert('Thank you for rating today mess meal!');
              }}
            >
              <Text style={styles.submitBtnText}>Submit Feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setRatingModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  topNavRow: { flexDirection: 'row', marginBottom: 12 },
  navChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: Tokens.colors.borderDark,
    borderRadius: 6,
    marginHorizontal: 3,
  },
  navChipText: { fontSize: 11, fontWeight: '600', color: Tokens.colors.textMuted, marginLeft: 4 },
  navChipTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  scrollContent: { paddingBottom: 20 },
  roomCard: { padding: 14, borderWidth: 2, borderRadius: 8, marginBottom: 12 },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  roomTitle: { fontSize: 16, fontWeight: 'bold' },
  roomSub: { fontSize: 12, color: Tokens.colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
  subHead: { fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
  roommateRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Tokens.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  nameText: { fontSize: 14, fontWeight: 'bold' },
  subText: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 1 },
  wardenRow: { flexDirection: 'row', alignItems: 'center' },
  callBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Tokens.colors.secondary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  callBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  newTicketBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, marginBottom: 12 },
  newTicketBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  ticketCard: { padding: 12, borderWidth: 2, borderRadius: 8, marginBottom: 10 },
  ticketId: { fontSize: 11, fontWeight: 'bold', color: Tokens.colors.primary },
  ticketTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  ticketDate: { fontSize: 10, color: Tokens.colors.textMuted, marginTop: 4 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusPillText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  rateMessBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  rateMessBtnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  dayChip: { paddingHorizontal: 14, paddingVertical: 6, borderWidth: 2, borderRadius: 20, marginRight: 8 },
  dayChipText: { fontSize: 12, color: Tokens.colors.textMuted },
  mealCard: { padding: 12, borderWidth: 2, borderRadius: 8, marginBottom: 10 },
  mealTitle: { fontSize: 13, fontWeight: 'bold' },
  mealMenuText: { fontSize: 12, color: Tokens.colors.textMuted, marginTop: 6, lineHeight: 18 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', padding: 18, borderWidth: 2, borderRadius: 8 },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  inputLabel: { fontSize: 12, fontWeight: 'bold', marginTop: 10, color: Tokens.colors.textMuted },
  catSelectChip: { paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderRadius: 4, marginRight: 6, marginBottom: 6 },
  modalInput: { borderWidth: 1, borderRadius: 6, padding: 10, fontSize: 13, marginTop: 6 },
  submitBtn: { paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 14 },
  submitBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { paddingVertical: 10, alignItems: 'center', marginTop: 6 },
  cancelBtnText: { color: Tokens.colors.textMuted, fontSize: 12 },
});
