import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getVenuesFromDB, getNearbyVenuesFromDB } from '../../services/firebaseService';
import { getCurrentCoords } from '../../services/locationService';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';

const FILTERS = ['All', 'Football', 'Cricket', 'Badminton', 'Basketball', 'Tennis'];

export default function ExploreScreen({ navigation }: any) {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [usingLocation, setUsingLocation] = useState(false);
  const [showingNearby, setShowingNearby] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { coords, usingFallback } = await getCurrentCoords();
        const nearby = await getNearbyVenuesFromDB(coords.latitude, coords.longitude, 20000);
        setUsingLocation(!usingFallback);
        setShowingNearby(nearby.length > 0);
        setVenues(nearby.length ? nearby : await getVenuesFromDB());
      } catch (e) {
        console.error(e);
        setShowingNearby(false);
        setVenues(await getVenuesFromDB());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return venues.filter(v => {
      const matchesSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.location.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === 'All' || (v.sports || []).includes(activeFilter);
      return matchesSearch && matchesFilter;
    });
  }, [venues, search, activeFilter]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('VenueDetails', { venueId: item.id })}>
      <GlassCard style={styles.card}>
        <View style={{ borderRadius: 16, overflow: 'hidden' }}>
          <Image source={{ uri: item.image + '?w=800' }} style={styles.img} />
          <LinearGradient colors={['transparent', 'rgba(2,6,23,0.5)']} style={StyleSheet.absoluteFill} />
          {/* Distance badge */}
          {typeof item.distanceKm === 'number' && (
            <View style={styles.distanceBadge}>
              <Ionicons name="location" size={11} color={colors.secondary} />
              <Text style={styles.distanceText}>{item.distanceKm} km</Text>
            </View>
          )}
          {/* Rating badge */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color="#fbbf24" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.infoRow}>
            <Text style={styles.venueName}>{item.name}</Text>
            <Text style={styles.price}>₹{item.price}<Text style={styles.perHr}>/hr</Text></Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={colors.textMuted} />
            <Text style={styles.location}>{item.location}</Text>
          </View>
          <View style={styles.tags}>
            {(item.sports || []).map((s: string) => (
              <View key={s} style={styles.tag}>
                <Text style={styles.tagText}>{s}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('BookingUI', { venueId: item.id, venueName: item.name })}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bookBtn}>
              <Ionicons name="calendar-outline" size={16} color="#fff" />
              <Text style={styles.bookBtnText}>Book Slot</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>
          {showingNearby
            ? `${filtered.length} venues near you ${usingLocation ? '' : '(enable location for real distances)'}`
            : `${filtered.length} venues · none within range, showing all`}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search venues or cities..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sport filter chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={item => item}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setActiveFilter(item)} style={[styles.filterChip, activeFilter === item && styles.filterChipActive]}>
            <Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
        style={styles.filterScroll}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="search-outline" size={48} color={colors.surfaceLight} />
              <Text style={styles.emptyText}>No venues found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 12, marginBottom: 14 },
  title: { fontSize: 30, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', paddingHorizontal: 14, gap: 10, marginBottom: 12 },
  searchInput: { flex: 1, color: colors.text, paddingVertical: 13, fontSize: 15 },
  filterScroll: { marginBottom: 14 },
  filterList: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#fff', fontWeight: '800' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: colors.textMuted, fontSize: 16, marginTop: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { marginBottom: 18, padding: 0, overflow: 'hidden' },
  img: { width: '100%', height: 170 },
  distanceBadge: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.62)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  distanceText: { color: colors.secondary, fontSize: 12, fontWeight: '800' },
  ratingBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.62)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  ratingText: { color: '#fbbf24', fontSize: 12, fontWeight: '800' },
  info: { padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  venueName: { fontSize: 20, fontWeight: '800', color: colors.text },
  price: { fontSize: 18, fontWeight: '900', color: colors.secondary },
  perHr: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  location: { fontSize: 13, color: colors.textMuted },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  tag: { backgroundColor: 'rgba(108,92,231,0.12)', paddingHorizontal: 11, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(108,92,231,0.2)' },
  tagText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  bookBtn: { borderRadius: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  bookBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
