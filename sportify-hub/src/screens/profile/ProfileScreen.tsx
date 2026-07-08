import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  ScrollView, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400';

export default function ProfileScreen({ navigation }: any) {
  const { userProfile, logout } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const xpPercent = userProfile ? userProfile.xp / userProfile.nextLevelXp : 0;

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', color: colors.secondary, onPress: undefined },
    {
      icon: userProfile?.phoneVerified ? 'checkmark-circle' : 'call-outline',
      label: userProfile?.phoneVerified ? `Phone Verified · ${userProfile?.phone}` : 'Verify Phone Number',
      color: userProfile?.phoneVerified ? '#10b981' : '#f59e0b',
      onPress: () => navigation.navigate('VerifyPhone'),
    },
    { icon: 'trophy-outline', label: 'My Tournaments', color: '#f59e0b', onPress: undefined },
    { icon: 'wallet-outline', label: 'Payments & Subscriptions', color: '#10b981', onPress: undefined },
    { icon: 'notifications-outline', label: 'Notifications', color: colors.primary, onPress: undefined },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Security', color: '#8b5cf6', onPress: undefined },
    { icon: 'help-circle-outline', label: 'Help & Support', color: colors.textMuted, onPress: undefined },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Profile</Text>
            <TouchableOpacity style={styles.settingsBtn}>
              <Ionicons name="settings-outline" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Avatar section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <LinearGradient colors={[colors.primary, '#8b5cf6', colors.secondary]} style={styles.avatarGlow} />
              <Image source={{ uri: userProfile?.avatar || DEFAULT_AVATAR }} style={styles.avatar} />
              <TouchableOpacity style={styles.cameraBtn}>
                <Ionicons name="camera" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>{userProfile?.name || 'Player'}</Text>
            <Text style={styles.email}>{userProfile?.email}</Text>
            <View style={styles.levelPill}>
              <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.levelPillGrad}>
                <Ionicons name="flash" size={12} color="#fff" />
                <Text style={styles.levelPillText}>LEVEL {userProfile?.level ?? 1}</Text>
              </LinearGradient>
            </View>
          </View>

          {/* XP card */}
          <GlassCard style={styles.xpCard}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpTitle}>XP PROGRESSION</Text>
              <Text style={styles.xpValues}>{userProfile?.xp ?? 0} / {userProfile?.nextLevelXp ?? 1000}</Text>
            </View>
            <View style={styles.progressBg}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${xpPercent * 100}%` }]}
              />
            </View>
            <Text style={styles.xpRemaining}>
              {Math.max(0, (userProfile?.nextLevelXp ?? 1000) - (userProfile?.xp ?? 0))} XP to Level {(userProfile?.level ?? 1) + 1}
            </Text>
          </GlassCard>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { val: userProfile?.matches ?? 0, label: 'Matches', icon: 'football-outline', color: colors.primary },
              { val: userProfile?.winRate ?? '0%', label: 'Win Rate', icon: 'pulse-outline', color: colors.secondary },
              { val: userProfile?.tournaments ?? 0, label: 'Cups', icon: 'trophy-outline', color: '#f59e0b' },
            ].map(s => (
              <GlassCard key={s.label} style={styles.statCard}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
                <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </GlassCard>
            ))}
          </View>

          {/* Menu items */}
          <GlassCard style={styles.menuCard}>
            <Text style={styles.menuSectionTitle}>ACCOUNT</Text>
            {menuItems.map((item, idx) => (
              <TouchableOpacity key={item.label} onPress={item.onPress} disabled={!item.onPress} style={[styles.menuItem, idx < menuItems.length - 1 && styles.menuItemBorder]}>
                <View style={[styles.menuIconBox, { backgroundColor: `${item.color}14` }]}>
                  <Ionicons name={item.icon as any} size={19} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
              </TouchableOpacity>
            ))}
          </GlassCard>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text },
  settingsBtn: { padding: 6 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarWrapper: { position: 'relative', marginBottom: 14, width: 116, height: 116, justifyContent: 'center', alignItems: 'center' },
  avatarGlow: { position: 'absolute', width: 116, height: 116, borderRadius: 58, opacity: 0.35 },
  avatar: { width: 104, height: 104, borderRadius: 52, borderWidth: 3, borderColor: 'rgba(255,255,255,0.1)' },
  cameraBtn: { position: 'absolute', bottom: 4, right: 4, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.background },
  name: { fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 4 },
  email: { fontSize: 13, color: colors.textMuted, marginBottom: 12 },
  levelPill: { borderRadius: 20, overflow: 'hidden' },
  levelPillGrad: { paddingHorizontal: 16, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 },
  levelPillText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  xpCard: { marginHorizontal: 20, marginBottom: 16, padding: 18 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  xpTitle: { fontSize: 10, fontWeight: '900', color: colors.textMuted, letterSpacing: 1.5 },
  xpValues: { fontSize: 12, fontWeight: '700', color: colors.text },
  progressBg: { height: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 5 },
  xpRemaining: { fontSize: 11, color: colors.textMuted, textAlign: 'right' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16, gap: 4 },
  statVal: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuCard: { marginHorizontal: 20, marginBottom: 14, padding: 6 },
  menuSectionTitle: { fontSize: 10, fontWeight: '900', color: colors.textMuted, letterSpacing: 1.5, paddingHorizontal: 14, paddingVertical: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, gap: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  menuIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 20, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: `${colors.error}30`, backgroundColor: `${colors.error}08` },
  logoutText: { color: colors.error, fontSize: 16, fontWeight: '700' },
});
