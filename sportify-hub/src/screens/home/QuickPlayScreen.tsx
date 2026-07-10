import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { quickJoinGameInDB, getGamesFromDB } from '../../services/firebaseService';

const SPORTS: Array<{ name: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { name: 'Football', icon: 'football' },
  { name: 'Basketball', icon: 'basketball' },
  { name: 'Badminton', icon: 'tennisball' },
  { name: 'Cricket', icon: 'baseball' },
  { name: 'Tennis', icon: 'tennisball' },
];

export default function QuickPlayScreen({ navigation }: any) {
  const { user } = useAuth();
  const [sport, setSport] = useState('Football');
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFindMatch = async () => {
    setMatching(true);
    setError(null);
    try {
      const uid = user?.uid || 'mock-uid';
      const { gameId } = await quickJoinGameInDB(uid, sport);
      const games = await getGamesFromDB();
      const matched = games.find(g => g.id === gameId);
      navigation.replace('GameDetails', { game: matched || { id: gameId, sport, players: [uid], maxPlayers: 10, level: 'Intermediate' } });
    } catch (e: any) {
      setError(e.message || `No open ${sport} matches right now.`);
    } finally {
      setMatching(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Quick Play</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <Ionicons name="flash" size={40} color={colors.secondary} style={{ alignSelf: 'center', marginBottom: 10 }} />
        <Text style={styles.subtitle}>Pick a sport and we'll instantly match you into an open match nearby.</Text>

        <Text style={styles.sectionTitle}>SPORT</Text>
        <View style={styles.sportGrid}>
          {SPORTS.map(s => (
            <TouchableOpacity
              key={s.name}
              style={[styles.sportChip, sport === s.name && styles.sportChipActive]}
              onPress={() => setSport(s.name)}
              activeOpacity={0.85}
            >
              <Ionicons name={s.icon} size={20} color={sport === s.name ? '#fff' : colors.secondary} />
              <Text style={[styles.sportChipText, sport === s.name && styles.sportChipTextActive]}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity onPress={handleFindMatch} disabled={matching} activeOpacity={0.88} style={styles.matchBtnWrap}>
          <LinearGradient colors={[colors.primary, '#7c3aed', colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.matchBtn}>
            {matching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="flash" size={18} color="#fff" />
                <Text style={styles.matchBtnText}>FIND MATCH</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  subtitle: { color: colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 30 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: colors.textMuted, letterSpacing: 1.2, marginBottom: 12 },
  sportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  sportChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  sportChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sportChipText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  sportChipTextActive: { color: '#fff' },
  errorText: { color: colors.error, fontSize: 13, textAlign: 'center', marginBottom: 16 },
  matchBtnWrap: { borderRadius: 16, overflow: 'hidden', marginTop: 'auto', marginBottom: 30 },
  matchBtn: { paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  matchBtnText: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
});
