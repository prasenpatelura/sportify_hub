import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { joinGameInDB, getPlayersByIdsFromDB } from '../../services/firebaseService';

const SPORT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Football: 'football',
  Badminton: 'tennisball',
  Basketball: 'basketball',
  Cricket: 'baseball',
  Tennis: 'tennisball',
};

const LEVEL_COLORS: Record<string, string> = {
  Beginner: '#10b981',
  Intermediate: '#f59e0b',
  Advanced: '#ef4444',
};

export default function GameDetailsScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const [game, setGame] = useState(route.params.game);
  const [roster, setRoster] = useState<Record<string, { name: string; avatar?: string }>>({});
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [joining, setJoining] = useState(false);

  const uid = user?.uid || 'mock-uid';
  const players: string[] = game.players || [];
  const joined = players.includes(uid);
  const full = players.length >= game.maxPlayers;
  const levelColor = LEVEL_COLORS[game.level] || colors.secondary;
  const hostId = game.hostId;

  useEffect(() => {
    (async () => {
      const idsToResolve = [...players, ...(hostId ? [hostId] : [])];
      setRoster(await getPlayersByIdsFromDB(idsToResolve));
      setLoadingRoster(false);
    })();
  }, []);

  const hostName = game.hostName || (hostId && roster[hostId]?.name) || 'Sportify Host';

  const handleJoin = async () => {
    if (joined) {
      Alert.alert('Already Joined', 'You are already in this match!');
      return;
    }
    if (full) {
      Alert.alert('Match Full', 'This match has no available slots.');
      return;
    }
    setJoining(true);
    try {
      await joinGameInDB(game.id, uid);
      setGame((g: any) => ({ ...g, players: [...(g.players || []), uid] }));
      Alert.alert('Joined!', `You have joined the ${game.sport} match. Have fun!`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not join the match.');
    } finally {
      setJoining(false);
    }
  };

  const nameFor = (playerId: string) => {
    if (playerId === uid) return 'You';
    return roster[playerId]?.name || 'Player';
  };

  const openSlots = Math.max(0, game.maxPlayers - players.length);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Match Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.topCard}>
          <View style={styles.topRow}>
            <LinearGradient colors={[`${colors.primary}22`, `${colors.secondary}11`]} style={styles.sportIconBg}>
              <Ionicons name={SPORT_ICONS[game.sport] || 'football-outline'} size={30} color={colors.secondary} />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.sportTitle}>{game.sport}</Text>
              <View style={[styles.levelBadge, { backgroundColor: `${levelColor}18`, borderColor: `${levelColor}40` }]}>
                <Text style={[styles.levelText, { color: levelColor }]}>{game.level}</Text>
              </View>
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <Text style={styles.detailText}>{game.date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={styles.detailText}>{game.time}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={styles.detailText}>{game.location || 'Elite Turf'}</Text>
            </View>
            {typeof game.distanceKm === 'number' && (
              <View style={styles.detailItem}>
                <Ionicons name="navigate-outline" size={14} color={colors.secondary} />
                <Text style={[styles.detailText, { color: colors.secondary, fontWeight: '700' }]}>{game.distanceKm} km away</Text>
              </View>
            )}
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>HOSTED BY</Text>
        <GlassCard style={styles.hostCard}>
          <View style={styles.hostAvatar}>
            <Ionicons name="person" size={20} color={colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.hostName}>{loadingRoster ? 'Loading...' : hostName}</Text>
            <Text style={styles.hostSub}>Match Organizer</Text>
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>
          PLAYERS · {players.length}/{game.maxPlayers} JOINED · {openSlots} AVAILABLE
        </Text>
        <GlassCard style={styles.rosterCard}>
          <View style={styles.fillBarBg}>
            <LinearGradient
              colors={full ? ['#ef4444', '#b91c1c'] : [colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.fillBar, { width: `${(players.length / game.maxPlayers) * 100}%` as any }]}
            />
          </View>

          {loadingRoster ? (
            <ActivityIndicator color={colors.secondary} style={{ marginTop: 14 }} />
          ) : (
            <View style={{ marginTop: 14 }}>
              {players.map((pid, idx) => (
                <View key={pid} style={[styles.playerRow, idx < players.length - 1 && styles.playerRowBorder]}>
                  <View style={styles.playerDot}>
                    <Ionicons name="person" size={14} color={colors.secondary} />
                  </View>
                  <Text style={styles.playerName}>{nameFor(pid)}</Text>
                  {pid === hostId && <Text style={styles.hostTag}>Host</Text>}
                </View>
              ))}
              {Array.from({ length: openSlots }).map((_, idx) => (
                <View key={`open-${idx}`} style={[styles.playerRow, idx < openSlots - 1 && styles.playerRowBorder]}>
                  <View style={[styles.playerDot, styles.openDot]}>
                    <Ionicons name="add" size={14} color={colors.textMuted} />
                  </View>
                  <Text style={styles.openSlotText}>Open Slot</Text>
                </View>
              ))}
            </View>
          )}
        </GlassCard>

        <TouchableOpacity
          onPress={handleJoin}
          disabled={joining || full || joined}
          style={{ borderRadius: 14, overflow: 'hidden', marginTop: 22 }}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={joined ? ['#10b981', '#059669'] : full ? ['#374151', '#374151'] : [colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.joinBtn}
          >
            {joining ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name={joined ? 'checkmark-circle' : full ? 'close-circle-outline' : 'add-circle-outline'} size={18} color="#fff" />
                <Text style={styles.joinBtnText}>{joined ? 'Already Joined' : full ? 'Match Full' : 'Join This Match'}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
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
  topCard: { padding: 18, marginBottom: 22 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  sportIconBg: { width: 58, height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  sportTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 6 },
  levelBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  levelText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  details: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailText: { color: colors.textMuted, fontSize: 13 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: colors.textMuted, letterSpacing: 1.2, marginBottom: 10 },
  hostCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginBottom: 22 },
  hostAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,212,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  hostName: { color: colors.text, fontSize: 15, fontWeight: '800' },
  hostSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  rosterCard: { padding: 16 },
  fillBarBg: { height: 7, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' },
  fillBar: { height: '100%', borderRadius: 4 },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  playerRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  playerDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,212,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  openDot: { backgroundColor: 'rgba(255,255,255,0.05)' },
  playerName: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '600' },
  openSlotText: { flex: 1, color: colors.textMuted, fontSize: 14, fontStyle: 'italic' },
  hostTag: { color: colors.secondary, fontSize: 11, fontWeight: '800', backgroundColor: 'rgba(0,212,255,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  joinBtn: { paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  joinBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
