import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Input, Card, DataList } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { en } from '@campus/i18n';
import { z } from 'zod';
import { ApiClient, AppError } from '@campus/api-client';

export const CampusServicesScreen: React.FC<{ apiClient: ApiClient; i18nDict?: typeof en }> = ({
  apiClient,
  i18nDict = en,
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'gym' | 'canteen' | 'bus'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryBooks, setLibraryBooks] = useState<{ id: string; title: string; author: string; available: boolean }[]>([]);
  const [gymSlots, setGymSlots] = useState<{ slotId: string; time: string; availableCapacity: number }[]>([]);
  const [canteenItems, setCanteenItems] = useState<{ id: string; name: string; price: number; category: string }[]>([]);
  const [busRoutes, setBusRoutes] = useState<{ id: string; routeName: string; liveLat: number; liveLng: number; status: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    fetchTabContent();

    if (activeTab === 'bus') {
      pollInterval = setInterval(() => {
        fetchBusLocation();
      }, 5000); // 5s poll interval for bus live location
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [activeTab]);

  const fetchTabContent = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'library') {
        const res = await apiClient.get(
          `/campus/library/search?q=${encodeURIComponent(searchQuery)}`,
          z.array(z.object({ id: z.string(), title: z.string(), author: z.string(), available: z.boolean() }))
        );
        setLibraryBooks(res);
      } else if (activeTab === 'gym') {
        const res = await apiClient.get(
          '/campus/gym/slots',
          z.array(z.object({ slotId: z.string(), time: z.string(), availableCapacity: z.number() }))
        );
        setGymSlots(res);
      } else if (activeTab === 'canteen') {
        const res = await apiClient.get(
          '/campus/canteen/menu',
          z.array(z.object({ id: z.string(), name: z.string(), price: z.number(), category: z.string() }))
        );
        setCanteenItems(res);
      } else if (activeTab === 'bus') {
        await fetchBusLocation();
      }
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setErrorMsg(err.message + (err.requestId ? ` (Req ID: ${err.requestId})` : ''));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBusLocation = async () => {
    try {
      const res = await apiClient.get(
        '/campus/bus/live',
        z.array(z.object({ id: z.string(), routeName: z.string(), liveLat: z.number(), liveLng: z.number(), status: z.string() }))
      );
      setBusRoutes(res);
    } catch (err: unknown) {
      // Background poll silently captures errors or sets banner
    }
  };

  const bookGymSlot = async (slotId: string) => {
    setIsLoading(true);
    try {
      await apiClient.post(
        `/campus/gym/slots/${slotId}/book`,
        z.object({ success: z.boolean() }),
        {}
      );
      fetchTabContent();
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.tabBar}>
        <Button label="Library" variant={activeTab === 'library' ? 'primary' : 'secondary'} onPress={() => setActiveTab('library')} testID="tab-library" />
        <Button label="Gym" variant={activeTab === 'gym' ? 'primary' : 'secondary'} onPress={() => setActiveTab('gym')} testID="tab-gym" />
        <Button label="Canteen" variant={activeTab === 'canteen' ? 'primary' : 'secondary'} onPress={() => setActiveTab('canteen')} testID="tab-canteen" />
        <Button label="Bus Routes" variant={activeTab === 'bus' ? 'primary' : 'secondary'} onPress={() => setActiveTab('bus')} testID="tab-bus" />
      </View>

      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

      {activeTab === 'library' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Library Catalogue & Search</Text>
          <Input label="Search by Title / Author" value={searchQuery} onChangeText={setSearchQuery} testID="input-library-search" />
          <Button label="Search Catalogue" onPress={fetchTabContent} testID="btn-search-library" />
          <DataList
            data={libraryBooks}
            isLoading={isLoading}
            onRefresh={fetchTabContent}
            emptyTitle="No Books Found"
            emptyDescription="Search for books in the campus library."
            renderItem={({ item }) => (
              <Card key={item.id} style={styles.itemCard}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>Author: {item.author}</Text>
                <Text style={styles.itemMeta}>Status: {item.available ? 'Available' : 'On Loan'}</Text>
              </Card>
            )}
          />
        </Card>
      )}

      {activeTab === 'gym' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Gym Slot Booking</Text>
          {gymSlots.map((slot) => (
            <Card key={slot.slotId} style={styles.itemCard}>
              <Text style={styles.itemTitle}>Time: {slot.time}</Text>
              <Text style={styles.itemMeta}>Spots Remaining: {slot.availableCapacity}</Text>
              <Button
                label="Book Slot"
                onPress={() => bookGymSlot(slot.slotId)}
                disabled={slot.availableCapacity <= 0}
                testID={`btn-book-gym-${slot.slotId}`}
              />
            </Card>
          ))}
        </Card>
      )}

      {activeTab === 'canteen' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Canteen Menu & Pricing</Text>
          {canteenItems.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.itemTitle}>{item.name} ({item.category})</Text>
              <Text style={styles.priceTag}>₹{item.price}</Text>
            </View>
          ))}
        </Card>
      )}

      {activeTab === 'bus' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Campus Bus Live Location (Polling)</Text>
          {busRoutes.map((bus) => (
            <Card key={bus.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>Route: {bus.routeName}</Text>
              <Text style={styles.itemMeta}>Status: {bus.status}</Text>
              <Text style={styles.itemMeta}>Live Coordinates: Lat {bus.liveLat.toFixed(4)}, Lng {bus.liveLng.toFixed(4)}</Text>
            </Card>
          ))}
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  tabBar: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md, flexWrap: 'wrap' },
  card: { padding: spacing.lg },
  title: { fontSize: typography.fontSize.xl, fontWeight: 'bold', color: colors.gray[900], marginBottom: spacing.md },
  errorText: { color: colors.danger.main, marginVertical: spacing.xs },
  itemCard: { padding: spacing.md, marginBottom: spacing.xs },
  itemTitle: { fontWeight: 'bold', fontSize: typography.fontSize.base },
  itemMeta: { fontSize: typography.fontSize.sm, color: colors.gray[600] },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
  priceTag: { fontWeight: 'bold', color: colors.primary[700] },
});
