import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getUserBookingsFromDB } from '../../services/firebaseService';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';

const STATUS_CONFIG: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Confirmed: { color: '#10b981', icon: 'checkmark-circle' },
  Pending: { color: '#f59e0b', icon: 'time' },
  Cancelled: { color: colors.error, icon: 'close-circle' },
};

export default function ActivityScreen({ navigation }: any) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const uid = user?.uid || 'mock-uid';
      const data = await getUserBookingsFromDB(uid);
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const renderBooking = ({ item }: { item: any }) => {
    const { color, icon } = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('BookingDetails', { bookingId: item.id })}>
      <GlassCard style={styles.card}>
        {/* Status header */}
        <View style={styles.cardTop}>
          <View style={[styles.statusBadge, { backgroundColor: `${color}14`, borderColor: `${color}30` }]}>
            <Ionicons name={icon} size={13} color={color} />
            <Text style={[styles.statusText, { color }]}>{item.status}</Text>
          </View>
          <Text style={styles.bookingId}>#{item.id?.slice(-6).toUpperCase()}</Text>
        </View>

        {/* Venue name */}
        <Text style={styles.venueName}>{item.venue?.name || item.venueName || 'Venue'}</Text>

        {/* Details row */}
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={styles.detailText}>{item.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={styles.detailText}>{item.timeSlot}</Text>
          </View>
          {item.venue?.location && (
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={styles.detailText}>{item.venue.location}</Text>
            </View>
          )}
        </View>

        {/* Sports tags */}
        {item.venue?.sports && (
          <View style={styles.tags}>
            {item.venue.sports.map((s: string) => (
              <View key={s} style={styles.tag}>
                <Text style={styles.tagText}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Price */}
        {item.venue?.price && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Slot Price</Text>
            <Text style={styles.priceValue}>₹{item.venue.price}</Text>
          </View>
        )}
      </GlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Activity</Text>
          <Text style={styles.subtitle}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchBookings}>
          <Ionicons name="refresh-outline" size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Total', val: bookings.length, color: colors.secondary },
          { label: 'Confirmed', val: bookings.filter(b => b.status === 'Confirmed').length, color: '#10b981' },
          { label: 'Pending', val: bookings.filter(b => b.status === 'Pending').length, color: '#f59e0b' },
        ].map(s => (
          <LinearGradient key={s.label} colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']} style={styles.summaryCard}>
            <Text style={[styles.summaryVal, { color: s.color }]}>{s.val}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </LinearGradient>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item.id}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="calendar-outline" size={52} color={colors.surfaceLight} />
              <Text style={styles.emptyText}>No bookings yet</Text>
              <Text style={styles.emptySubtext}>Book a slot to get started!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, marginBottom: 16 },
  title: { fontSize: 30, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  refreshBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,212,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 18 },
  summaryCard: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  summaryVal: { fontSize: 22, fontWeight: '900' },
  summaryLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { marginBottom: 16, padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '800' },
  bookingId: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  venueName: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 12 },
  details: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailText: { color: colors.textMuted, fontSize: 13 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag: { backgroundColor: 'rgba(108,92,231,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 12 },
  priceLabel: { fontSize: 13, color: colors.textMuted },
  priceValue: { fontSize: 16, fontWeight: '900', color: colors.secondary },
  emptyText: { color: colors.textMuted, fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtext: { color: colors.textMuted, fontSize: 14, marginTop: 6, opacity: 0.7 },
});
