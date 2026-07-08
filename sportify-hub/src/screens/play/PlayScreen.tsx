import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToGames, getNearbyGamesFromDB, joinGameInDB } from '../../services/firebaseService';
import { getCurrentCoords } from '../../services/locationService';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';

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

export default function PlayScreen() {
  const { user } = useAuth();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [distanceById, setDistanceById] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const { coords } = await getCurrentCoords();
      const nearby = await getNearbyGamesFromDB(coords.latitude, coords.longitude, 20000);
      const map: Record<string, number> = {};
      nearby.forEach((g: any) => { if (typeof g.distanceKm === 'number') map[g.id] = g.distanceKm; });
      setDistanceById(map);
    })();

    const unsubscribe = subscribeToGames(data => {
      setGames(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const sortedGames = [...games].sort((a, b) => {
    const da = distanceById[a.id] ?? Infinity;
    const db = distanceById[b.id] ?? Infinity;
    return da - db;
  });

  const handleJoin = async (game: any) => {
    const uid = user?.uid || 'mock-uid';
    if ((game.players || []).includes(uid)) {
      Alert.alert('Already Joined', 'You are already in this match!');
      return;
    }
    if ((game.players || []).length >= game.maxPlayers) {
      Alert.alert('Match Full', 'This match has no available slots.');
      return;
    }
    setJoiningId(game.id);
    try {
      await joinGameInDB(game.id, uid);
      Alert.alert('Joined!', `You have joined the ${game.sport} match. Have fun!`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not join the match.');
    } finally {
      setJoiningId(null);
    }
  };

  const renderGame = ({ item }: { item: any }) => {
    const uid = user?.uid || 'mock-uid';
    const joined = (item.players || []).includes(uid);
    const full = (item.players || []).length >= item.maxPlayers;
    const fillPct = ((item.players || []).length / item.maxPlayers) * 100;
    const levelColor = LEVEL_COLORS[item.level] || colors.secondary;

    return (
      <GlassCard style={styles.card}>
        {/* Header row */}
        <View style={styles.cardTop}>
          <LinearGradient colors={[`${colors.primary}22`, `${colors.secondary}11`]} style={styles.sportIconBg}>
            <Ionicons name={SPORT_ICONS[item.sport] || 'football-outline'} size={26} color={colors.secondary} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.sportTitle}>{item.sport}</Text>
            <View style={[styles.levelBadge, { backgroundColor: `${levelColor}18`, borderColor: `${levelColor}40` }]}>
              <Text style={[styles.levelText, { color: levelColor }]}>{item.level}</Text>
            </View>
          </View>
          {joined && (
            <View style={styles.joinedTag}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.joinedText}>Joined</Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={styles.detailText}>{item.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.detailText}>{item.location || 'Elite Turf'}</Text>
          </View>
          {typeof distanceById[item.id] === 'number' && (
            <View style={styles.detailItem}>
              <Ionicons name="navigate-outline" size={14} color={colors.secondary} />
              <Text style={[styles.detailText, { color: colors.secondary, fontWeight: '700' }]}>
                {distanceById[item.id]} km away
              </Text>
            </View>
          )}
        </View>

        {/* Player fill bar */}
        <View style={styles.fillBarBg}>
          <LinearGradient
            colors={full ? ['#ef4444', '#b91c1c'] : [colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.fillBar, { width: `${fillPct}%` as any }]}
          />
        </View>
        <Text style={styles.playersLabel}>
          {(item.players || []).length} / {item.maxPlayers} players  ·  {item.maxPlayers - (item.players || []).length} slots left
        </Text>

        {/* Join button */}
        <TouchableOpacity
          onPress={() => handleJoin(item)}
          disabled={joiningId === item.id || full || joined}
          style={{ borderRadius: 12, overflow: 'hidden', marginTop: 12 }}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={
              joined ? ['#10b981', '#059669'] :
              full ? ['#374151', '#374151'] :
              [colors.primary, colors.secondary]
            }
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.joinBtn}
          >
            {joiningId === item.id ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name={joined ? 'checkmark-circle' : full ? 'close-circle-outline' : 'add-circle-outline'} size={18} color="#fff" />
                <Text style={styles.joinBtnText}>
                  {joined ? 'Already Joined' : full ? 'Match Full' : 'Join Now'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </GlassCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Games & Matches</Text>
        <Text style={styles.subtitle}>Live • Updated in real-time</Text>
        <View style={styles.liveDot}>
          <View style={styles.pulse} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : (
        <FlatList
          data={sortedGames}
          keyExtractor={item => item.id}
          renderItem={renderGame}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="football-outline" size={52} color={colors.surfaceLight} />
              <Text style={styles.emptyText}>No games available right now.</Text>
              <Text style={styles.emptySubtext}>Check back soon!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 12, marginBottom: 18 },
  title: { fontSize: 30, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  liveDot: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  pulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  liveText: { fontSize: 11, color: '#10b981', fontWeight: '900', letterSpacing: 1.5 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { marginBottom: 16, padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  sportIconBg: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  sportTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 4 },
  levelBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  levelText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  joinedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  joinedText: { color: colors.success, fontSize: 12, fontWeight: '700' },
  details: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 14 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailText: { color: colors.textMuted, fontSize: 13 },
  fillBarBg: { height: 7, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  fillBar: { height: '100%', borderRadius: 4 },
  playersLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  joinBtn: { paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  joinBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  emptyText: { color: colors.textMuted, fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtext: { color: colors.textMuted, fontSize: 14, marginTop: 6, opacity: 0.7 },
});
