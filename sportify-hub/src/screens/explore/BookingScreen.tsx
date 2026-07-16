import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { bookSlotInDB, getBookedSlotsFromDB } from '../../services/firebaseService';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';

const TIME_SLOTS = ['06:00 AM', '07:00 AM', '08:00 AM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const nextSevenDays = () => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return { day: DAY_NAMES[d.getDay()], date: String(d.getDate()), iso: d.toISOString().slice(0, 10) };
  });
};

export default function BookingScreen({ route, navigation }: any) {
  const { venueId, venueName } = route.params;
  const { user } = useAuth();
  const [dates] = useState(nextSevenDays);
  const [selectedIso, setSelectedIso] = useState(dates[0].iso);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const refreshBookedSlots = async () => {
    setLoadingSlots(true);
    try {
      const slots = await getBookedSlotsFromDB(venueId, selectedIso);
      setBookedSlots(slots);
      setSelectedSlot(prev => (prev && slots.includes(prev) ? '' : prev));
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoadingSlots(true);
    getBookedSlotsFromDB(venueId, selectedIso).then((slots) => {
      if (cancelled) return;
      setBookedSlots(slots);
      setSelectedSlot(prev => (prev && slots.includes(prev) ? '' : prev));
      setLoadingSlots(false);
    });
    return () => { cancelled = true; };
  }, [venueId, selectedIso]);

  const handleConfirm = async () => {
    if (!selectedSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }
    if (bookedSlots.includes(selectedSlot)) {
      Alert.alert('Slot Unavailable', 'This time slot is already booked. Please choose another.');
      return;
    }
    setLoading(true);
    try {
      const booking = await bookSlotInDB(user?.uid || 'mock-uid', venueId, venueName, selectedIso, selectedSlot);
      Alert.alert('Success', 'Your booking is confirmed!', [
        { text: 'View Details', onPress: () => navigation.replace('BookingDetails', { bookingId: booking.id }) },
        { text: 'OK', onPress: () => navigation.navigate('MainApp', { screen: 'Activity' }) },
      ]);
    } catch (e: any) {
      console.error(e);
      // Someone else may have just taken this slot — refresh so the grid reflects it.
      await refreshBookedSlots();
      Alert.alert('Could Not Book Slot', e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Slot</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.venueHeaderContainer}>
            <Text style={styles.venueName}>{venueName}</Text>
            <TouchableOpacity style={styles.directionsButton} onPress={() => Alert.alert('Directions', 'Opening Maps...')}>
                <Ionicons name="navigate-circle" size={20} color={colors.secondary} />
                <Text style={styles.directionsText}>Get Directions</Text>
            </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesContainer}>
          {dates.map((d) => (
            <TouchableOpacity
              key={d.iso}
              onPress={() => setSelectedIso(d.iso)}
              style={[styles.dateCard, selectedIso === d.iso && styles.selectedDateCard]}
            >
              <Text style={[styles.dayText, selectedIso === d.iso && styles.selectedText]}>{d.day}</Text>
              <Text style={[styles.dateText, selectedIso === d.iso && styles.selectedText]}>{d.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.slotsHeaderRow}>
          <Text style={styles.sectionTitle}>Available Slots</Text>
          {loadingSlots && <ActivityIndicator size="small" color={colors.secondary} />}
        </View>
        <View style={styles.slotsContainer}>
          {TIME_SLOTS.map((slot) => {
            const isBooked = bookedSlots.includes(slot);
            return (
              <TouchableOpacity
                key={slot}
                onPress={() => !isBooked && setSelectedSlot(slot)}
                disabled={isBooked}
                style={[styles.slotItem, selectedSlot === slot && styles.selectedSlotItem, isBooked && styles.bookedSlotItem]}
              >
                <Text style={[styles.slotText, selectedSlot === slot && styles.selectedText, isBooked && styles.bookedSlotText]}>
                  {slot}
                </Text>
                {isBooked && <Text style={styles.bookedLabel}>Booked</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <GlassCard style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{selectedIso}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>{selectedSlot || 'Not Selected'}</Text>
          </View>
          
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.background} /> : <Text style={styles.confirmText}>Confirm Booking</Text>}
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  content: { padding: 20 },
  venueHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  venueName: { fontSize: 24, fontWeight: 'bold', color: colors.secondary, flex: 1 },
  directionsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 212, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0, 212, 255, 0.3)' },
  directionsText: { color: colors.secondary, fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  sectionTitle: { fontSize: 18, color: colors.text, fontWeight: '600', marginBottom: 15 },
  slotsHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  datesContainer: { marginBottom: 30 },
  dateCard: { width: 60, height: 80, backgroundColor: colors.surface, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: colors.surfaceLight },
  selectedDateCard: { backgroundColor: colors.primary, borderColor: colors.primaryLight },
  dayText: { color: colors.textMuted, fontSize: 12 },
  dateText: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  selectedText: { color: '#fff' },
  slotsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  slotItem: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.surfaceLight, minWidth: '45%' },
  selectedSlotItem: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  bookedSlotItem: { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)', opacity: 0.55 },
  slotText: { color: colors.text, fontSize: 14, textAlign: 'center' },
  bookedSlotText: { color: colors.textMuted, textDecorationLine: 'line-through' },
  bookedLabel: { color: colors.error, fontSize: 10, fontWeight: '800', textAlign: 'center', marginTop: 3, letterSpacing: 0.5 },
  summaryCard: { marginTop: 20 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: colors.textMuted },
  summaryValue: { color: colors.text, fontWeight: '600' },
  confirmButton: { backgroundColor: colors.secondary, padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  confirmText: { color: colors.background, fontSize: 18, fontWeight: 'bold' }
});
