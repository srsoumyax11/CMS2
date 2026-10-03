import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Tokens } from '../src/theme/tokens';

interface NotificationItem {
  id: string;
  category: 'academic' | 'outpass' | 'safety' | 'general';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    category: 'safety',
    title: 'Emergency SOS Broadcast',
    body: 'Campus security has been dispatched for Building H1. Please follow warden guidelines.',
    time: '5 mins ago',
    read: false,
  },
  {
    id: '2',
    category: 'outpass',
    title: 'Outpass Approved',
    body: 'Your weekend outpass (#OP-9821) has been approved by Warden R. Sharma.',
    time: '20 mins ago',
    read: false,
  },
  {
    id: '3',
    category: 'academic',
    title: 'Timetable Period Changed',
    body: 'Data Structures lecture rescheduled to Room 304, Block B at 02:00 PM.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '4',
    category: 'general',
    title: 'Mess Menu Updated',
    body: 'Special Paneer dinner menu published for Hostel Block 1 & 2.',
    time: '3 hours ago',
    read: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [filter, setFilter] = useState<'all' | 'academic' | 'outpass' | 'safety'>('all');
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = notifications.filter((n) => (filter === 'all' ? true : n.category === filter));

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.topBar, { backgroundColor: surface, borderColor: border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={textPrimary} />
          <Text style={[styles.title, { color: textPrimary }]}>Notification Inbox</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={markAllRead}>
          <Text style={[styles.markReadText, { color: Tokens.colors.primary }]}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'academic', 'outpass', 'safety'] as const).map((tab) => {
          const isSelected = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected ? Tokens.colors.primary : surface,
                  borderColor: isSelected ? Tokens.colors.primary : border,
                },
              ]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterText, { color: isSelected ? '#FFFFFF' : textPrimary }]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notifications List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={48} color={Tokens.colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>No Notifications Found</Text>
            <Text style={styles.emptySub}>You have no notifications under the selected category.</Text>
          </View>
        ) : (
          filtered.map((item) => {
            const catColor =
              item.category === 'safety'
                ? Tokens.colors.accentRed
                : item.category === 'outpass'
                ? Tokens.colors.accentOrange
                : item.category === 'academic'
                ? Tokens.colors.primary
                : Tokens.colors.secondary;

            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: surface,
                    borderColor: item.read ? border : catColor,
                    borderWidth: item.read ? Tokens.borderWidths.flat : Tokens.borderWidths.thick,
                  },
                ]}
              >
                <View style={styles.itemHeader}>
                  <View style={[styles.catBadge, { backgroundColor: catColor }]}>
                    <Text style={styles.catBadgeText}>{item.category.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>

                <Text style={[styles.itemTitle, { color: textPrimary }]}>{item.title}</Text>
                <Text style={styles.itemBody}>{item.body}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.md,
    borderBottomWidth: Tokens.borderWidths.flat,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.sm },
  title: { fontSize: 18, fontWeight: '900' },
  markReadText: { fontSize: 12, fontWeight: '800' },
  filterRow: { flexDirection: 'row', padding: Tokens.spacing.md, gap: Tokens.spacing.xs },
  filterChip: { flex: 1, paddingVertical: Tokens.spacing.xs, alignItems: 'center', borderRadius: Tokens.radii.pill, borderWidth: Tokens.borderWidths.flat },
  filterText: { fontSize: 10, fontWeight: '800' },
  listContent: { padding: Tokens.spacing.md, gap: Tokens.spacing.md },
  itemCard: { padding: Tokens.spacing.md, borderRadius: Tokens.radii.md },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Tokens.spacing.xs },
  catBadge: { paddingHorizontal: Tokens.spacing.xs, paddingVertical: 2, borderRadius: Tokens.radii.sm },
  catBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  timeText: { fontSize: 11, color: Tokens.colors.textMuted },
  itemTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  itemBody: { fontSize: 12, color: Tokens.colors.textMuted, lineHeight: 16 },
  emptyBox: { alignItems: 'center', paddingVertical: Tokens.spacing.xxl },
  emptyTitle: { fontSize: 16, fontWeight: '800', marginTop: Tokens.spacing.sm },
  emptySub: { fontSize: 12, color: Tokens.colors.textMuted, textAlign: 'center', marginTop: 4 },
});
