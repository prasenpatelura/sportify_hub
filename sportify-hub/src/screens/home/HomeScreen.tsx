import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  ScrollView, ActivityIndicator, Dimensions, Animated, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getVenuesFromDB, subscribeToGames } from '../../services/firebaseService';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/ui/GlassCard';

const { width } = Dimensions.get('window');

// FluidTabBar floats as an absolutely-positioned pill (16 side margin, 64 tall,
// bottom-offset 30 on iOS / 16 on Android) — the FAB must clear its top edge
// plus a gap, or it renders underneath the tab bar's blur overlay.
const FAB_BOTTOM = (Platform.OS === 'ios' ? 30 : 16) + 64 + 14;

const SPORT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Football: 'football',
  Badminton: 'tennisball',
  Basketball: 'basketball',
  Cricket: 'baseball',
  Tennis: 'tennisball',
};

export default function HomeScreen({ navigation }: any) {
  const { userProfile } = useAuth();
  const [venues, setVenues] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const headerFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  const xpPercent = userProfile ? userProfile.xp / userProfile.nextLevelXp : 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, friction: 7, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.timing(progressWidth, { toValue: xpPercent, duration: 1200, useNativeDriver: false }).start();

    const fetchVenues = async () => {
      try {
        const v = await getVenuesFromDB();
        setVenues(v);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();

    const unsubscribe = subscribeToGames(setGames);
    return unsubscribe;
  }, []);

  const renderVenue = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.venueCard}
      onPress={() => navigation.navigate('VenueDetails', { venueId: item.id })}
      activeOpacity={0.88}
    >
      <Image source={{ uri: item.image + '?w=600' }} style={styles.venueImg} />
      <LinearGradient colors={['transparent', 'rgba(2,6,23,0.95)']} style={styles.venueGrad} />
      <View style={styles.venueRatingBadge}>
        <Ionicons name="star" size={11} color="#fbbf24" />
        <Text style={styles.venueRatingText}>{item.rating}</Text>
      </View>
      <View style={styles.venueContent}>
        <Text style={styles.venueName}>{item.name}</Text>
        <View style={styles.venueRow}>
          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
          <Text style={styles.venueLocation}>{item.location}</Text>
          <Text style={styles.venuePrice}> · ₹{item.price}/hr</Text>
        </View>
        <View style={styles.venueSports}>
          {(item.sports || []).slice(0, 2).map((s: string) => (
            <View key={s} style={styles.sportChip}>
              <Ionicons name={SPORT_ICONS[s] || 'football-outline'} size={10} color={colors.secondary} />
              <Text style={styles.sportChipText}>{s}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ──────────────────────────────────────────── */}
        <Animated.View style={[styles.header, { opacity: headerFade }]}>
          <View>
            <Text style={styles.greeting}>Hello, <Text style={styles.name}>{userProfile?.name?.split(' ')[0] || 'Champ'}!</Text></Text>
            <Text style={styles.subGreeting}>Ready to dominate today?</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {userProfile?.streak ?? 0}</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── XP Card ─────────────────────────────────────────── */}
        <Animated.View style={{ transform: [{ translateY: cardSlide }], opacity: headerFade }}>
          <LinearGradient colors={['#1a0d4a', '#0f172a']} style={styles.xpCard}>
            <View style={styles.xpTop}>
              <View style={styles.xpLeft}>
                <Text style={styles.xpLevelLabel}>LEVEL</Text>
                <Text style={styles.xpLevelValue}>{userProfile?.level ?? 1}</Text>
              </View>
              <View style={styles.xpDivider} />
              <View style={styles.xpRight}>
                <View style={styles.xpLabelRow}>
                  <Text style={styles.xpLabel}>XP PROGRESS</Text>
                  <Text style={styles.xpNumbers}>{userProfile?.xp ?? 0} / {userProfile?.nextLevelXp ?? 1000}</Text>
                </View>
                <View style={styles.progressBg}>
                  <Animated.View style={[styles.progressFill, {
                    width: progressWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                  }]}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
                  </Animated.View>
                </View>
                <Text style={styles.xpToNext}>
                  {Math.max(0, (userProfile?.nextLevelXp ?? 1000) - (userProfile?.xp ?? 0))} XP to next level
                </Text>
              </View>
            </View>
            {/* Mini stats */}
            <View style={styles.miniStats}>
              {[
                { icon: 'trophy-outline', val: userProfile?.matches ?? 0, label: 'Matches' },
                { icon: 'pulse-outline', val: userProfile?.winRate ?? '0%', label: 'Win Rate' },
                { icon: 'ribbon-outline', val: userProfile?.tournaments ?? 0, label: 'Cups' },
              ].map(s => (
                <View key={s.label} style={styles.miniStat}>
                  <Ionicons name={s.icon as any} size={16} color={colors.secondary} />
                  <Text style={styles.miniStatVal}>{s.val}</Text>
                  <Text style={styles.miniStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Venues ──────────────────────────────────────────── */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Featured Venues</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={venues}
              keyExtractor={item => item.id}
              renderItem={renderVenue}
              contentContainerStyle={styles.venueList}
            />

            {/* ── Live Games ──────────────────────────────────── */}
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Live Games</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Play')}>
                <Text style={styles.seeAll}>Find More →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.gamesList}>
              {games.length === 0 ? (
                <Text style={styles.emptyText}>No live games right now.</Text>
              ) : (
                games.map(game => (
                  <TouchableOpacity
                    key={game.id}
                    activeOpacity={0.92}
                    onPress={() => navigation.navigate('GameDetails', { game })}
                  >
                  <GlassCard style={styles.gameCard}>
                    <View style={styles.gameTop}>
                      <View style={styles.gameIconBg}>
                        <Ionicons name={SPORT_ICONS[game.sport] || 'football-outline'} size={22} color={colors.secondary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.gameSport}>{game.sport}</Text>
                        <Text style={styles.gameLevel}>{game.level}</Text>
                      </View>
                      <View style={styles.slotsBadge}>
                        <Ionicons name="people-outline" size={12} color={colors.secondary} />
                        <Text style={styles.slotsText}>
                          {(game.players || []).length}/{game.maxPlayers}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.gameInfo}>
                      <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.gameInfoText}>{game.time} · Today</Text>
                      <Ionicons name="location-outline" size={14} color={colors.textMuted} style={{ marginLeft: 12 }} />
                      <Text style={styles.gameInfoText}>{game.location || 'Elite Turf'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('GameDetails', { game })} activeOpacity={0.85}>
                      <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.joinBtn}>
                        <Text style={styles.joinBtnText}>Join Match</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </GlassCard>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Quick Play FAB ──────────────────────────────────── */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('QuickPlay')} activeOpacity={0.88}>
        <LinearGradient colors={[colors.primary, '#7c3aed', colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fabGrad}>
          <Ionicons name="flash" size={20} color="#fff" />
          <Text style={styles.fabText}>QUICK PLAY</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 190 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, marginBottom: 18 },
  greeting: { fontSize: 22, fontWeight: '900', color: colors.text },
  name: { color: colors.secondary },
  subGreeting: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakBadge: { backgroundColor: 'rgba(234,88,12,0.12)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(234,88,12,0.25)' },
  streakText: { color: '#ea580c', fontWeight: '800', fontSize: 13 },
  notifBtn: { position: 'relative', padding: 4 },
  notifDot: { position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error, borderWidth: 1.5, borderColor: colors.background },
  xpCard: { marginHorizontal: 20, marginBottom: 26, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(108,92,231,0.2)' },
  xpTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  xpLeft: { alignItems: 'center', marginRight: 20 },
  xpLevelLabel: { fontSize: 9, fontWeight: '900', color: colors.textMuted, letterSpacing: 1.5 },
  xpLevelValue: { fontSize: 32, fontWeight: '900', color: colors.secondary, lineHeight: 36 },
  xpDivider: { width: 1, height: 44, backgroundColor: 'rgba(255,255,255,0.08)', marginRight: 20 },
  xpRight: { flex: 1 },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLabel: { fontSize: 9, fontWeight: '900', color: colors.textMuted, letterSpacing: 1 },
  xpNumbers: { fontSize: 10, fontWeight: '700', color: colors.text },
  progressBg: { height: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 5 },
  xpToNext: { fontSize: 10, color: colors.textMuted, textAlign: 'right' },
  miniStats: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 14 },
  miniStat: { alignItems: 'center', gap: 3 },
  miniStatVal: { fontSize: 16, fontWeight: '900', color: colors.text },
  miniStatLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14, marginTop: 6 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  seeAll: { color: colors.secondary, fontSize: 13, fontWeight: '700' },
  venueList: { paddingHorizontal: 20, gap: 14 },
  venueCard: { width: width * 0.72, height: 200, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.surface, marginRight: 14 },
  venueImg: { width: '100%', height: '100%' },
  venueGrad: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '70%' },
  venueRatingBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  venueRatingText: { color: '#fbbf24', fontSize: 12, fontWeight: '800' },
  venueContent: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  venueName: { color: '#fff', fontSize: 17, fontWeight: '800', marginBottom: 4 },
  venueRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  venueLocation: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginLeft: 3 },
  venuePrice: { color: colors.secondary, fontSize: 12, fontWeight: '700' },
  venueSports: { flexDirection: 'row', gap: 6 },
  sportChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,212,255,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  sportChipText: { color: colors.secondary, fontSize: 10, fontWeight: '700' },
  gamesList: { paddingHorizontal: 20 },
  gameCard: { marginBottom: 14, padding: 16 },
  gameTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  gameIconBg: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(0,212,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  gameSport: { fontSize: 17, fontWeight: '800', color: colors.text },
  gameLevel: { fontSize: 12, color: colors.secondary, fontWeight: '600' },
  slotsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,212,255,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  slotsText: { color: colors.secondary, fontSize: 12, fontWeight: '800' },
  gameInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  gameInfoText: { color: colors.textMuted, fontSize: 13, marginLeft: 4 },
  joinBtn: { borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  joinBtnText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.3 },
  emptyText: { color: colors.textMuted, textAlign: 'center', paddingVertical: 30 },
  fab: { position: 'absolute', bottom: FAB_BOTTOM, right: 20, left: 20, height: 58, borderRadius: 29, overflow: 'hidden', elevation: 20, zIndex: 50, shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20 },
  fabGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  fabText: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
});
