import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getBookingDetailsFromDB } from '../../services/firebaseService';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';

const STATUS_CONFIG: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Confirmed: { color: '#10b981', icon: 'checkmark-circle' },
  Pending: { color: '#f59e0b', icon: 'time' },
  Cancelled: { color: colors.error, icon: 'close-circle' },
};

export default function BookingDetailsScreen({ route, navigation }: any) {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setBooking(await getBookingDetailsFromDB(bookingId));
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={{ color: colors.textMuted, marginTop: 12 }}>Could not load this booking.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.secondary, fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { color, icon } = STATUS_CONFIG[booking.status] || STATUS_CONFIG.Pending;
  const venue = booking.venue;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: venue?.image }} style={styles.image} />
          <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} style={styles.topGradient} />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={[styles.statusBadge, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
            <Ionicons name={icon} size={14} color={color} />
            <Text style={[styles.statusText, { color }]}>{booking.status || 'Confirmed'}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.bookingId}>Booking #{String(booking.id).slice(-6).toUpperCase()}</Text>
          <Text style={styles.venueName}>{venue?.name || 'Venue'}</Text>
          {venue?.location && (
            <Text style={styles.location}>
              <Ionicons name="location-outline" size={16} color={colors.textMuted} /> {venue.location}
            </Text>
          )}

          <View style={styles.divider} />

          <GlassCard style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailLabelRow}>
                <Ionicons name="calendar-outline" size={18} color={colors.secondary} />
                <Text style={styles.detailLabel}>Date</Text>
              </View>
              <Text style={styles.detailValue}>{booking.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailLabelRow}>
                <Ionicons name="time-outline" size={18} color={colors.secondary} />
                <Text style={styles.detailLabel}>Time Slot</Text>
              </View>
              <Text style={styles.detailValue}>{booking.timeSlot}</Text>
            </View>
            {venue?.price != null && (
              <View style={styles.detailRow}>
                <View style={styles.detailLabelRow}>
                  <Ionicons name="cash-outline" size={18} color={colors.secondary} />
                  <Text style={styles.detailLabel}>Price</Text>
                </View>
                <Text style={styles.detailValue}>₹{venue.price}/hr</Text>
              </View>
            )}
          </GlassCard>

          {venue?.sports && (
            <>
              <Text style={styles.sectionTitle}>Sports Available</Text>
              <View style={styles.sportsContainer}>
                {venue.sports.map((sport: string) => (
                  <View key={sport} style={styles.sportBadge}>
                    <Text style={styles.sportText}>{sport}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity
            style={styles.directionsButton}
            onPress={() => Alert.alert('Directions', 'Opening Maps...')}
          >
            <Ionicons name="navigate-circle" size={20} color={colors.secondary} />
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>

          <View style={styles.spacer} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  imageContainer: { height: 260, width: '100%', position: 'relative' },
  image: { width: '100%', height: '100%' },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 80 },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 12 },
  statusBadge: { position: 'absolute', top: 50, right: 20, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '800' },
  content: { padding: 20, marginTop: -30, backgroundColor: colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  bookingId: { fontSize: 12, color: colors.textMuted, fontWeight: '700', marginBottom: 4 },
  venueName: { fontSize: 26, fontWeight: 'bold', color: colors.text, marginBottom: 6 },
  location: { fontSize: 16, color: colors.textMuted, marginBottom: 10 },
  divider: { height: 1, backgroundColor: colors.surfaceLight, marginVertical: 16 },
  detailsCard: { marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  detailLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { color: colors.textMuted, fontSize: 14 },
  detailValue: { color: colors.text, fontSize: 15, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
  sportsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  sportBadge: { backgroundColor: colors.primary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  sportText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  directionsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(0, 212, 255, 0.1)', paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0, 212, 255, 0.3)' },
  directionsText: { color: colors.secondary, fontSize: 15, fontWeight: 'bold' },
  spacer: { height: 60 },
});
