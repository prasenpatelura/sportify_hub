import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';

const STORAGE_KEY = 'sportify_notification_prefs';

const DEFAULT_PREFS = {
  matchInvites: true,
  matchReminders: true,
  bookingUpdates: true,
  promotions: false,
};

export default function NotificationsScreen({ navigation }: any) {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
      setLoaded(true);
    });
  }, []);

  const toggle = (key: keyof typeof DEFAULT_PREFS) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const ROWS: Array<{ key: keyof typeof DEFAULT_PREFS; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { key: 'matchInvites', label: 'Match Invites', desc: 'When someone invites you to a match', icon: 'football-outline' },
    { key: 'matchReminders', label: 'Match Reminders', desc: 'Reminders before your matches start', icon: 'time-outline' },
    { key: 'bookingUpdates', label: 'Booking Updates', desc: 'Confirmations and changes to your bookings', icon: 'calendar-outline' },
    { key: 'promotions', label: 'Promotions & Offers', desc: 'Discounts and news from Sportify Hub', icon: 'megaphone-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.card}>
          {ROWS.map((row, idx) => (
            <View key={row.key} style={[styles.row, idx < ROWS.length - 1 && styles.rowBorder]}>
              <View style={styles.rowIconBox}>
                <Ionicons name={row.icon} size={18} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowDesc}>{row.desc}</Text>
              </View>
              <Switch
                value={prefs[row.key]}
                onValueChange={() => toggle(row.key)}
                disabled={!loaded}
                trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },
  card: { padding: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  rowIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(0,212,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  rowLabel: { color: colors.text, fontSize: 14, fontWeight: '700' },
  rowDesc: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
});
