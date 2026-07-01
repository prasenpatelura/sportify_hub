import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getVenueDetails } from '../../services/api';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';

export default function VenueDetailsScreen({ route, navigation }: any) {
  const { venueId } = route.params;
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getVenueDetails(venueId);
        setVenue(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [venueId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: venue.image }} style={styles.image} />
          <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} style={styles.topGradient} />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{venue.name}</Text>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{venue.rating}</Text>
            </View>
          </View>

          <Text style={styles.location}>
            <Ionicons name="location-outline" size={16} color={colors.textMuted} /> {venue.location}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>About Venue</Text>
          <Text style={styles.description}>
            Experience top-tier sports facilities at {venue.name}. Fully equipped with modern amenities, 
            professional lighting, and premium turf quality. Perfect for both casual matches and competitive tournaments.
          </Text>

          <Text style={styles.sectionTitle}>Sports Available</Text>
          <View style={styles.sportsContainer}>
            {venue.sports?.map((sport: string) => (
              <View key={sport} style={styles.sportBadge}>
                <Text style={styles.sportText}>{sport}</Text>
              </View>
            ))}
          </View>

          <GlassCard style={styles.priceCard}>
            <View>
              <Text style={styles.priceLabel}>Price per Hour</Text>
              <Text style={styles.priceValue}>₹{venue.price}</Text>
            </View>
            <TouchableOpacity 
              style={styles.bookButton} 
              onPress={() => navigation.navigate('BookingUI', { venueId: venue.id, venueName: venue.name })}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </GlassCard>
          
          <View style={styles.spacer} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  imageContainer: { height: 300, width: '100%', position: 'relative' },
  image: { width: '100%', height: '100%' },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 80 },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 12 },
  content: { padding: 20, marginTop: -30, backgroundColor: colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  name: { fontSize: 26, fontWeight: 'bold', color: colors.text },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  ratingText: { color: colors.text, marginLeft: 5, fontWeight: 'bold' },
  location: { fontSize: 16, color: colors.textMuted, marginBottom: 20 },
  divider: { height: 1, backgroundColor: colors.surfaceLight, marginVertical: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 10, marginTop: 10 },
  description: { fontSize: 15, color: colors.textMuted, lineHeight: 22, marginBottom: 20 },
  sportsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  sportBadge: { backgroundColor: colors.primary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  sportText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  priceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  priceLabel: { color: colors.textMuted, fontSize: 14 },
  priceValue: { color: colors.secondary, fontSize: 24, fontWeight: 'bold' },
  bookButton: { backgroundColor: colors.secondary, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
  bookButtonText: { color: colors.background, fontSize: 16, fontWeight: 'bold' },
  spacer: { height: 100 }
});
