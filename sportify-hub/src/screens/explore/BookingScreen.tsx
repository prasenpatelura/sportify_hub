import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { bookSlot } from '../../services/api';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';

const TIME_SLOTS = ['06:00 AM', '07:00 AM', '08:00 AM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'];
const DATES = [
  { day: 'Mon', date: '20' },
  { day: 'Tue', date: '21' },
  { day: 'Wed', date: '22' },
  { day: 'Thu', date: '23' },
  { day: 'Fri', date: '24' },
  { day: 'Sat', date: '25' },
];

export default function BookingScreen({ route, navigation }: any) {
  const { venueId, venueName } = route.params;
  const [selectedDate, setSelectedDate] = useState('20');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }
    setLoading(true);
    try {
      await bookSlot(venueId, `2026-04-${selectedDate}`, selectedSlot);
      Alert.alert('Success', 'Your booking is confirmed!', [
        { text: 'View Activity', onPress: () => navigation.navigate('MainApp', { screen: 'Activity' }) },
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Something went wrong');
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
          {DATES.map((d) => (
            <TouchableOpacity 
              key={d.date} 
              onPress={() => setSelectedDate(d.date)}
              style={[styles.dateCard, selectedDate === d.date && styles.selectedDateCard]}
            >
              <Text style={[styles.dayText, selectedDate === d.date && styles.selectedText]}>{d.day}</Text>
              <Text style={[styles.dateText, selectedDate === d.date && styles.selectedText]}>{d.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Available Slots</Text>
        <View style={styles.slotsContainer}>
          {TIME_SLOTS.map((slot) => (
            <TouchableOpacity 
              key={slot} 
              onPress={() => setSelectedSlot(slot)}
              style={[styles.slotItem, selectedSlot === slot && styles.selectedSlotItem]}
            >
              <Text style={[styles.slotText, selectedSlot === slot && styles.selectedText]}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <GlassCard style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>April {selectedDate}, 2026</Text>
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
  datesContainer: { marginBottom: 30 },
  dateCard: { width: 60, height: 80, backgroundColor: colors.surface, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: colors.surfaceLight },
  selectedDateCard: { backgroundColor: colors.primary, borderColor: colors.primaryLight },
  dayText: { color: colors.textMuted, fontSize: 12 },
  dateText: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  selectedText: { color: '#fff' },
  slotsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  slotItem: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.surfaceLight, minWidth: '45%' },
  selectedSlotItem: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  slotText: { color: colors.text, fontSize: 14, textAlign: 'center' },
  summaryCard: { marginTop: 20 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: colors.textMuted },
  summaryValue: { color: colors.text, fontWeight: '600' },
  confirmButton: { backgroundColor: colors.secondary, padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  confirmText: { color: colors.background, fontSize: 18, fontWeight: 'bold' }
});
