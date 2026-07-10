import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';
import { useAuth } from '../../context/AuthContext';

export default function MyTournamentsScreen({ navigation }: any) {
  const { userProfile } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Tournaments</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.statCard}>
          <Ionicons name="trophy" size={28} color="#f59e0b" />
          <Text style={styles.statVal}>{userProfile?.tournaments ?? 0}</Text>
          <Text style={styles.statLabel}>Cups won so far</Text>
        </GlassCard>

        <View style={styles.emptyState}>
          <Ionicons name="ribbon-outline" size={56} color={colors.surfaceLight} />
          <Text style={styles.emptyTitle}>No tournaments yet</Text>
          <Text style={styles.emptyText}>
            You haven't joined any tournaments. Tournament hosting and registration is coming soon to Sportify Hub — check back here once it launches.
          </Text>
        </View>
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
  statCard: { alignItems: 'center', paddingVertical: 24, marginBottom: 24, gap: 6 },
  statVal: { fontSize: 30, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 10 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
