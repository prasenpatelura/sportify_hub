import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';

const FAQS = [
  { q: 'How do I join a match?', a: 'Go to the Play tab, pick any open game, and tap "Join Now". You\'ll be added instantly if slots are available.' },
  { q: 'How do I book a venue?', a: 'Open a venue from Explore or Home, then tap "Book Slot" to choose a date and time.' },
  { q: 'Can I cancel a booking?', a: 'Open the booking from My Activity to view its details. Cancellation support is coming soon.' },
  { q: 'How does Quick Play work?', a: 'Quick Play instantly matches you into an open game near you for the sport you pick, so you don\'t have to browse manually.' },
];

export default function HelpSupportScreen({ navigation }: any) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
        <GlassCard style={styles.card}>
          {FAQS.map((f, idx) => (
            <TouchableOpacity
              key={f.q}
              style={[styles.faqRow, idx < FAQS.length - 1 && styles.faqBorder]}
              onPress={() => setOpenIdx(openIdx === idx ? null : idx)}
              activeOpacity={0.8}
            >
              <View style={styles.faqHead}>
                <Text style={styles.faqQ}>{f.q}</Text>
                <Ionicons name={openIdx === idx ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
              </View>
              {openIdx === idx && <Text style={styles.faqA}>{f.a}</Text>}
            </TouchableOpacity>
          ))}
        </GlassCard>

        <Text style={styles.sectionTitle}>CONTACT US</Text>
        <GlassCard style={styles.card}>
          <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('mailto:support@sportifyhub.app')}>
            <Ionicons name="mail-outline" size={20} color={colors.secondary} />
            <Text style={styles.contactText}>support@sportifyhub.app</Text>
          </TouchableOpacity>
          <View style={styles.faqBorder} />
          <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('tel:+911234567890')}>
            <Ionicons name="call-outline" size={20} color={colors.secondary} />
            <Text style={styles.contactText}>+91 12345 67890</Text>
          </TouchableOpacity>
        </GlassCard>

        <Text style={styles.versionText}>Sportify Hub · v1.0.0</Text>
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
  sectionTitle: { fontSize: 11, fontWeight: '900', color: colors.textMuted, letterSpacing: 1.2, marginBottom: 10, marginTop: 4 },
  card: { padding: 6, marginBottom: 28 },
  faqRow: { paddingHorizontal: 14, paddingVertical: 14 },
  faqBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  faqHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '700', marginRight: 10 },
  faqA: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 10 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  contactText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  versionText: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: 4 },
});
