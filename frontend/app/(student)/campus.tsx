import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Tokens } from '../../src/theme/tokens';

interface Club {
  id: string;
  name: string;
  category: string;
  membersCount: number;
  lead: string;
  joined: boolean;
  color: string;
}

interface CampusEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  organizer: string;
  registered: boolean;
}

interface PlacementDrive {
  id: string;
  company: string;
  role: string;
  ctc: string;
  minCgpa: number;
  deadline: string;
  applied: boolean;
}

export default function CampusScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [activeTab, setActiveTab] = useState<'clubs' | 'events' | 'placements' | 'awards'>('clubs');

  // Mock Clubs Data
  const [clubs, setClubs] = useState<Club[]>([
    {
      id: 'c-1',
      name: 'Hack Campus Developer Club',
      category: 'Technical',
      membersCount: 340,
      lead: 'Aman Varma',
      joined: true,
      color: Tokens.colors.primary,
    },
    {
      id: 'c-2',
      name: 'Robotics & AI Society',
      category: 'Technical',
      membersCount: 180,
      lead: 'Neha Sharma',
      joined: false,
      color: Tokens.colors.accentPurple,
    },
    {
      id: 'c-3',
      name: 'Campus Symphony & Music Guild',
      category: 'Cultural',
      membersCount: 120,
      lead: 'Rohan Joshi',
      joined: false,
      color: Tokens.colors.accentOrange,
    },
  ]);

  // Mock Events Data
  const [events, setEvents] = useState<CampusEvent[]>([
    {
      id: 'e-101',
      title: 'HackCampus 24-Hour AI Hackathon',
      date: 'Oct 12 - 13, 2026',
      venue: 'Auditorium Hall A',
      organizer: 'Hack Campus Dev Club',
      registered: true,
    },
    {
      id: 'e-102',
      title: 'Industry Keynote: Future of Quantum Computing',
      date: 'Oct 18, 2026 • 04:00 PM',
      venue: 'Main Seminar Room 3',
      organizer: 'Department of CS',
      registered: false,
    },
  ]);

  // Mock Placement Drives Data
  const [placements, setPlacements] = useState<PlacementDrive[]>([
    {
      id: 'p-1',
      company: 'Google / Alphabet',
      role: 'Software Development Engineer I',
      ctc: '₹28.5 LPA',
      minCgpa: 8.0,
      deadline: 'Oct 10, 2026',
      applied: true,
    },
    {
      id: 'p-2',
      company: 'Microsoft',
      role: 'Cloud Solution Architect',
      ctc: '₹26.0 LPA',
      minCgpa: 7.5,
      deadline: 'Oct 15, 2026',
      applied: false,
    },
    {
      id: 'p-3',
      company: 'Amazon AWS',
      role: 'Systems Engineer',
      ctc: '₹22.0 LPA',
      minCgpa: 7.0,
      deadline: 'Oct 20, 2026',
      applied: false,
    },
  ]);

  const toggleClubJoin = (id: string) => {
    setClubs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, joined: !c.joined, membersCount: c.joined ? c.membersCount - 1 : c.membersCount + 1 } : c))
    );
  };

  const toggleEventRegister = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, registered: !e.registered } : e)));
  };

  const handleApplyPlacement = (id: string) => {
    setPlacements((prev) => prev.map((p) => (p.id === id ? { ...p, applied: true } : p)));
    alert('Application submitted successfully to T&P Cell!');
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Top Filter Tabs Bar */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'clubs' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('clubs')}
        >
          <Text style={[styles.tabText, activeTab === 'clubs' && styles.tabTextActive]}>Clubs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'events' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>Events</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'placements' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('placements')}
        >
          <Text style={[styles.tabText, activeTab === 'placements' && styles.tabTextActive]}>Placements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'awards' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('awards')}
        >
          <Text style={[styles.tabText, activeTab === 'awards' && styles.tabTextActive]}>Locker</Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: Clubs */}
      {activeTab === 'clubs' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Campus Student Organizations</Text>
          {clubs.map((c) => (
            <View key={c.id} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.iconBox, { backgroundColor: c.color }]}>
                  <Ionicons name="people" size={24} color="#FFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.cardTitle, { color: textPrimary }]}>{c.name}</Text>
                  <Text style={styles.cardSub}>{c.category} • {c.membersCount} Members • Lead: {c.lead}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: c.joined ? Tokens.colors.secondary : Tokens.colors.primary },
                ]}
                onPress={() => toggleClubJoin(c.id)}
              >
                <Text style={styles.actionBtnText}>{c.joined ? 'Member ✓' : 'Join Club'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Tab 2: Events */}
      {activeTab === 'events' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Upcoming Campus Events & Seminars</Text>
          {events.map((e) => (
            <View key={e.id} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: textPrimary }]}>{e.title}</Text>
                  <Text style={styles.cardSub}>Organized by {e.organizer}</Text>
                </View>
                {e.registered && (
                  <View style={[styles.badge, { backgroundColor: Tokens.colors.secondary }]}>
                    <Text style={styles.badgeText}>Pass Generated</Text>
                  </View>
                )}
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color={Tokens.colors.primary} />
                  <Text style={[styles.metaText, { color: textPrimary }]}>{e.date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color={Tokens.colors.accentOrange} />
                  <Text style={[styles.metaText, { color: textPrimary }]}>{e.venue}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: e.registered ? Tokens.colors.accentPurple : Tokens.colors.primary },
                ]}
                onPress={() => toggleEventRegister(e.id)}
              >
                <Text style={styles.actionBtnText}>{e.registered ? 'Registered (Cancel Pass)' : 'Register for Event (Free)'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Tab 3: Placements */}
      {activeTab === 'placements' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.bannerCard, { backgroundColor: '#EFF6FF', borderColor: Tokens.colors.primary }]}>
            <Ionicons name="briefcase-outline" size={24} color={Tokens.colors.primary} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.bannerTitle}>Training & Placement Cell (T&P)</Text>
              <Text style={styles.bannerSub}>Eligible Student Status: Verified (CGPA: 8.82 / 10.0)</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Active Recruitment Drives</Text>
          {placements.map((p) => (
            <View key={p.id} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: textPrimary }]}>{p.company}</Text>
                  <Text style={[styles.roleText, { color: Tokens.colors.primary }]}>{p.role}</Text>
                </View>
                <View style={[styles.ctcBadge, { backgroundColor: '#ECFDF5', borderColor: Tokens.colors.secondary }]}>
                  <Text style={[styles.ctcText, { color: Tokens.colors.secondary }]}>{p.ctc}</Text>
                </View>
              </View>

              <View style={styles.placementMeta}>
                <Text style={styles.metaText}>Min CGPA: {p.minCgpa}</Text>
                <Text style={styles.metaText}>Deadline: {p.deadline}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: p.applied ? Tokens.colors.secondary : Tokens.colors.primary },
                ]}
                disabled={p.applied}
                onPress={() => handleApplyPlacement(p.id)}
              >
                <Text style={styles.actionBtnText}>{p.applied ? 'Application Submitted ✓' : 'Apply Now'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Tab 4: Digital Awards Locker */}
      {activeTab === 'awards' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Verified Certificates & Achievements</Text>
          {[
            { title: 'Dean List Honor Award 2025', date: 'Issued Dec 2025', issuer: 'Academic Council' },
            { title: 'Smart India Hackathon Finalist Certificate', date: 'Issued Aug 2025', issuer: 'MoE Innovation Cell' },
          ].map((item, idx) => (
            <View key={idx} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="ribbon-outline" size={28} color={Tokens.colors.accentOrange} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: textPrimary }]}>{item.title}</Text>
                  <Text style={styles.cardSub}>{item.issuer} • {item.date}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.downloadCertBtn, { borderColor: Tokens.colors.primary }]}
                onPress={() => alert('Downloading official signed PDF certificate...')}
              >
                <Ionicons name="download-outline" size={16} color={Tokens.colors.primary} />
                <Text style={[styles.downloadCertText, { color: Tokens.colors.primary }]}>Download Verified PDF</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
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
    marginHorizontal: 2,
    alignItems: 'center',
  },
  tabText: { fontSize: 11, fontWeight: '600', color: Tokens.colors.textMuted },
  tabTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  scrollContent: { paddingBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  card: { padding: 14, borderWidth: 2, borderRadius: 8, marginBottom: 12 },
  iconBox: { width: 42, height: 42, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: 'bold' },
  cardSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2 },
  actionBtn: { marginTop: 12, paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  actionBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 11, marginLeft: 4 },
  bannerCard: { flexDirection: 'row', padding: 12, borderWidth: 2, borderRadius: 8, marginBottom: 12, alignItems: 'center' },
  bannerTitle: { fontSize: 13, fontWeight: 'bold', color: Tokens.colors.primary },
  bannerSub: { fontSize: 11, color: Tokens.colors.textDark, marginTop: 2 },
  roleText: { fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  ctcBadge: { paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderRadius: 4 },
  ctcText: { fontSize: 11, fontWeight: 'bold' },
  placementMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  downloadCertBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, paddingVertical: 8, borderRadius: 6, marginTop: 12 },
  downloadCertText: { fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
});
