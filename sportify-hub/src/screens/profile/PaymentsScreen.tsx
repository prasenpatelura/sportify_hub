import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { getUserBookingsFromDB } from '../../services/firebaseService';

export default function PaymentsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserBookingsFromDB(user?.uid || 'mock-uid');
        setBookings(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Payments & Subscriptions</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>PAYMENT METHODS</Text>
        <GlassCard style={styles.emptyMethodCard}>
          <Ionicons name="card-outline" size={28} color={colors.textMuted} />
          <Text style={styles.emptyMethodText}>No payment methods added</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => Alert.alert('Add Payment Method', 'Card & UPI linking is coming soon.')}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Add Payment Method</Text>
          </TouchableOpacity>
        </GlassCard>

        <Text style={styles.sectionTitle}>TRANSACTION HISTORY</Text>
        {loading ? (
          <ActivityIndicator color={colors.secondary} style={{ marginTop: 20 }} />
        ) : bookings.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet.</Text>
        ) : (
          bookings.map((b) => (
            <TouchableOpacity
              key={b.id}
              onPress={() => navigation.navigate('BookingDetails', { bookingId: b.id })}
              activeOpacity={0.85}
            >
              <GlassCard style={styles.txnCard}>
                <View style={styles.txnIconBox}>
                  <Ionicons name="receipt-outline" size={18} color={colors.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txnVenue}>{b.venue?.name || 'Booking'}</Text>
                  <Text style={styles.txnDate}>{b.date} · {b.timeSlot}</Text>
                </View>
                <Text style={styles.txnAmount}>₹{b.venue?.price ?? '—'}</Text>
              </GlassCard>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  title: { fontSize: 17, fontWeight: '800', color: colors.text },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: colors.textMuted, letterSpacing: 1.2, marginBottom: 10, marginTop: 4 },
  emptyMethodCard: { alignItems: 'center', paddingVertical: 22, gap: 10, marginBottom: 28 },
  emptyMethodText: { color: colors.textMuted, fontSize: 13 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginTop: 4 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 10 },
  txnCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, padding: 14 },
  txnIconBox: { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(0,212,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  txnVenue: { color: colors.text, fontSize: 14, fontWeight: '700' },
  txnDate: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  txnAmount: { color: colors.secondary, fontSize: 15, fontWeight: '800' },
});
