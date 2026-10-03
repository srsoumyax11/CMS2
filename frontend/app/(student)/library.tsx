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

interface BookItem {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  availableCopies: number;
  totalCopies: number;
  coverColor: string;
}

interface IssuedBook {
  id: string;
  title: string;
  author: string;
  issueDate: string;
  dueDate: string;
  daysRemaining: number;
  renewalsLeft: number;
  fineAmount: number;
}

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [activeTab, setActiveTab] = useState<'issued' | 'catalog' | 'reservations'>('issued');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [reserveModalBook, setReserveModalBook] = useState<BookItem | null>(null);
  const [reserveSuccess, setReserveSuccess] = useState(false);

  // Mock Issued Books Data
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([
    {
      id: 'ib-1',
      title: 'Introduction to Algorithms (4th Ed)',
      author: 'Thomas H. Cormen et al.',
      issueDate: 'Sep 15, 2026',
      dueDate: 'Oct 05, 2026',
      daysRemaining: 2,
      renewalsLeft: 2,
      fineAmount: 0,
    },
    {
      id: 'ib-2',
      title: 'Database System Concepts',
      author: 'Abraham Silberschatz',
      issueDate: 'Aug 20, 2026',
      dueDate: 'Sep 25, 2026',
      daysRemaining: -8,
      renewalsLeft: 0,
      fineAmount: 160,
    },
  ]);

  // Mock Catalog Books
  const catalogBooks: BookItem[] = [
    {
      id: 'cat-1',
      title: 'Computer Networking: A Top-Down Approach',
      author: 'James F. Kurose',
      isbn: '978-0133594140',
      category: 'Computer Science',
      availableCopies: 4,
      totalCopies: 10,
      coverColor: Tokens.colors.primary,
    },
    {
      id: 'cat-2',
      title: 'Operating System Concepts (10th Ed)',
      author: 'Abraham Silberschatz',
      isbn: '978-1118063330',
      category: 'Computer Science',
      availableCopies: 0,
      totalCopies: 8,
      coverColor: Tokens.colors.accentOrange,
    },
    {
      id: 'cat-3',
      title: 'Artificial Intelligence: A Modern Approach',
      author: 'Stuart Russell & Peter Norvig',
      isbn: '978-0134610993',
      category: 'AI & Data Science',
      availableCopies: 2,
      totalCopies: 5,
      coverColor: Tokens.colors.accentPurple,
    },
    {
      id: 'cat-4',
      title: 'Engineering Mathematics III',
      author: 'B.S. Grewal',
      isbn: '978-8174091955',
      category: 'Mathematics',
      availableCopies: 12,
      totalCopies: 25,
      coverColor: Tokens.colors.secondary,
    },
  ];

  const categories = ['All', 'Computer Science', 'AI & Data Science', 'Mathematics', 'Electronics'];

  const filteredCatalog = catalogBooks.filter((b) => {
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleRenewBook = (id: string) => {
    setIssuedBooks((prev) =>
      prev.map((b) => {
        if (b.id === id && b.renewalsLeft > 0) {
          return {
            ...b,
            dueDate: 'Oct 19, 2026',
            daysRemaining: 16,
            renewalsLeft: b.renewalsLeft - 1,
          };
        }
        return b;
      })
    );
  };

  const totalOverdueFine = issuedBooks.reduce((sum, b) => sum + b.fineAmount, 0);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Top Header Summary */}
      <View style={[styles.summaryCard, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{issuedBooks.length}</Text>
          <Text style={styles.summaryLabel}>Books Issued</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: totalOverdueFine > 0 ? Tokens.colors.accentRed : Tokens.colors.secondary }]}>
            ₹{totalOverdueFine}
          </Text>
          <Text style={styles.summaryLabel}>Overdue Fine</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>3</Text>
          <Text style={styles.summaryLabel}>Max Limit</Text>
        </View>
      </View>

      {/* Tabs Bar */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'issued' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('issued')}
        >
          <Text style={[styles.tabText, activeTab === 'issued' && styles.tabTextActive]}>Issued Books</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'catalog' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('catalog')}
        >
          <Text style={[styles.tabText, activeTab === 'catalog' && styles.tabTextActive]}>Library Catalog</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'reservations' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('reservations')}
        >
          <Text style={[styles.tabText, activeTab === 'reservations' && styles.tabTextActive]}>Holds & Holds</Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: Issued Books */}
      {activeTab === 'issued' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {totalOverdueFine > 0 && (
            <View style={[styles.fineAlert, { backgroundColor: '#FEF2F2', borderColor: Tokens.colors.accentRed }]}>
              <Ionicons name="warning-outline" size={20} color={Tokens.colors.accentRed} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.fineAlertTitle}>Overdue Books Detected</Text>
                <Text style={styles.fineAlertSub}>Please return overdue books to avoiding accumulating ₹20/day penalty fine.</Text>
              </View>
            </View>
          )}

          {issuedBooks.map((book) => {
            const isOverdue = book.daysRemaining < 0;
            return (
              <View key={book.id} style={[styles.bookCard, { backgroundColor: surface, borderColor: isOverdue ? Tokens.colors.accentRed : border }]}>
                <View style={styles.bookHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bookTitle, { color: textPrimary }]}>{book.title}</Text>
                    <Text style={styles.bookAuthor}>by {book.author}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: isOverdue ? Tokens.colors.accentRed : book.daysRemaining <= 3 ? Tokens.colors.accentOrange : Tokens.colors.secondary },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {isOverdue ? `${Math.abs(book.daysRemaining)} Days Overdue` : `${book.daysRemaining} Days Left`}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaGrid}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Issue Date:</Text>
                    <Text style={[styles.metaVal, { color: textPrimary }]}>{book.issueDate}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Due Date:</Text>
                    <Text style={[styles.metaVal, { color: isOverdue ? Tokens.colors.accentRed : textPrimary }]}>{book.dueDate}</Text>
                  </View>
                </View>

                {isOverdue ? (
                  <View style={styles.overdueBox}>
                    <Text style={styles.overdueText}>Accrued Fine: ₹{book.fineAmount}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.renewBtn,
                      { backgroundColor: book.renewalsLeft > 0 ? Tokens.colors.primary : Tokens.colors.borderDark },
                    ]}
                    disabled={book.renewalsLeft === 0}
                    onPress={() => handleRenewBook(book.id)}
                  >
                    <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.renewBtnText}>
                      {book.renewalsLeft > 0 ? `Renew Loan (${book.renewalsLeft} Renewals Left)` : 'No Renewals Left'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Tab 2: Library Catalog Search */}
      {activeTab === 'catalog' && (
        <View style={{ flex: 1 }}>
          <View style={styles.searchBarContainer}>
            <View style={[styles.searchInputWrapper, { backgroundColor: surface, borderColor: border }]}>
              <Ionicons name="search" size={18} color={Tokens.colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: textPrimary }]}
                placeholder="Search by Title, Author, or ISBN..."
                placeholderTextColor={Tokens.colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Category Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  { backgroundColor: selectedCategory === cat ? Tokens.colors.primary : surface, borderColor: border },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && { color: '#FFFFFF', fontWeight: 'bold' }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredCatalog}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.scrollContent}
            renderItem={({ item }) => (
              <View style={[styles.bookCard, { backgroundColor: surface, borderColor: border }]}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.bookCover, { backgroundColor: item.coverColor }]}>
                    <Ionicons name="book" size={28} color="#FFFFFF" />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.bookTitle, { color: textPrimary }]}>{item.title}</Text>
                    <Text style={styles.bookAuthor}>by {item.author}</Text>
                    <Text style={styles.isbnText}>ISBN: {item.isbn} • {item.category}</Text>

                    <View style={styles.copiesRow}>
                      <Text style={[styles.copiesText, { color: item.availableCopies > 0 ? Tokens.colors.secondary : Tokens.colors.accentRed }]}>
                        {item.availableCopies > 0 ? `${item.availableCopies}/${item.totalCopies} Available` : 'Out of Stock'}
                      </Text>

                      <TouchableOpacity
                        style={[
                          styles.reserveBtn,
                          { backgroundColor: item.availableCopies > 0 ? Tokens.colors.primary : Tokens.colors.accentOrange },
                        ]}
                        onPress={() => {
                          setReserveModalBook(item);
                          setReserveSuccess(false);
                        }}
                      >
                        <Text style={styles.reserveBtnText}>
                          {item.availableCopies > 0 ? 'Hold Book' : 'Join Waiting List'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {/* Tab 3: Reservations */}
      {activeTab === 'reservations' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.emptyCard, { backgroundColor: surface, borderColor: border }]}>
            <Ionicons name="bookmark-outline" size={48} color={Tokens.colors.primary} />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>1 Active Book Hold</Text>
            <Text style={styles.emptySub}>"Artificial Intelligence: A Modern Approach" is reserved. Pickup before Oct 06, 2026 at Central Library Desk 2.</Text>
          </View>
        </ScrollView>
      )}

      {/* Reserve Confirmation Modal */}
      <Modal visible={!!reserveModalBook} animationType="fade" transparent onRequestClose={() => setReserveModalBook(null)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>
              {reserveSuccess ? 'Reservation Confirmed! 🎉' : 'Confirm Book Reservation'}
            </Text>

            {reserveSuccess ? (
              <View style={{ alignItems: 'center', marginVertical: 16 }}>
                <Ionicons name="checkmark-circle" size={54} color={Tokens.colors.secondary} />
                <Text style={[styles.modalText, { color: textPrimary, textAlign: 'center', marginTop: 10 }]}>
                  Your hold for "{reserveModalBook?.title}" is active. Please collect it from the library counter within 48 hours.
                </Text>
                <TouchableOpacity
                  style={[styles.confirmModalBtn, { backgroundColor: Tokens.colors.primary, marginTop: 16 }]}
                  onPress={() => setReserveModalBook(null)}
                >
                  <Text style={styles.confirmModalBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={[styles.modalText, { color: textPrimary, marginVertical: 12 }]}>
                  Book: <Text style={{ fontWeight: 'bold' }}>{reserveModalBook?.title}</Text>
                  {'\n'}Author: {reserveModalBook?.author}
                  {'\n'}Pickup Location: Campus7 Central Library (Floor 2)
                </Text>

                <TouchableOpacity
                  style={[styles.confirmModalBtn, { backgroundColor: Tokens.colors.primary }]}
                  onPress={() => setReserveSuccess(true)}
                >
                  <Text style={styles.confirmModalBtnText}>Confirm Hold</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setReserveModalBook(null)}>
                  <Text style={styles.cancelModalBtnText}>Cancel</Text>
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
  summaryCard: {
    flexDirection: 'row',
    padding: 14,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: { alignItems: 'center' },
  summaryNum: { fontSize: 20, fontWeight: 'bold', color: Tokens.colors.primary },
  summaryLabel: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2 },
  summaryDivider: { width: 1, height: '70%', backgroundColor: Tokens.colors.borderLight },
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
  fineAlert: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  fineAlertTitle: { fontSize: 13, fontWeight: 'bold', color: Tokens.colors.accentRed },
  fineAlertSub: { fontSize: 11, color: Tokens.colors.textDark, marginTop: 2 },
  bookCard: {
    padding: 14,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 12,
  },
  bookHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bookTitle: { fontSize: 15, fontWeight: 'bold' },
  bookAuthor: { fontSize: 12, color: Tokens.colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  metaGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  metaItem: { flexDirection: 'row' },
  metaLabel: { fontSize: 11, color: Tokens.colors.textMuted, marginRight: 4 },
  metaVal: { fontSize: 11, fontWeight: '600' },
  overdueBox: {
    marginTop: 10,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Tokens.colors.accentRed,
  },
  overdueText: { fontSize: 12, fontWeight: 'bold', color: Tokens.colors.accentRed, textAlign: 'center' },
  renewBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  renewBtnText: { fontSize: 12, fontWeight: 'bold', color: '#FFFFFF', marginLeft: 6 },
  searchBarContainer: { marginBottom: 10 },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 2,
    borderRadius: 8,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13 },
  categoryScroll: { maxHeight: 38, marginBottom: 12 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 2,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: { fontSize: 12, color: Tokens.colors.textMuted },
  bookCover: { width: 44, height: 60, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  isbnText: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2 },
  copiesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  copiesText: { fontSize: 11, fontWeight: 'bold' },
  reserveBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  reserveBtnText: { fontSize: 11, fontWeight: 'bold', color: '#FFFFFF' },
  emptyCard: { padding: 24, borderWidth: 2, borderRadius: 8, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 12 },
  emptySub: { fontSize: 12, color: Tokens.colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', padding: 20, borderWidth: 2, borderRadius: 8 },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  modalText: { fontSize: 13, lineHeight: 20 },
  confirmModalBtn: { paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 12 },
  confirmModalBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  cancelModalBtn: { paddingVertical: 10, alignItems: 'center', marginTop: 6 },
  cancelModalBtnText: { color: Tokens.colors.textMuted, fontSize: 13 },
});
