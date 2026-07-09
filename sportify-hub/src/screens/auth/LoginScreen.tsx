import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  Animated, Alert, ScrollView, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { apiSendOtp } from '../../services/backendApi';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  const { signInWithPhone, signInDemo } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 45, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 30, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSendCode = async () => {
    if (!phone.trim()) {
      Alert.alert('Missing Number', 'Please enter your phone number.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiSendOtp(phone.trim());
      setDevCode(res.devCode || null);
      setStep('code');
    } catch (e: any) {
      Alert.alert(
        'Could Not Send Code',
        'Could not connect to server. Please use Demo Mode to explore the app.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Demo', onPress: handleDemo },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      Alert.alert('Missing Code', 'Please enter the 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      await signInWithPhone(phone.trim(), code.trim(), name.trim() || undefined);
    } catch (e: any) {
      Alert.alert('Verification Failed', e.message || 'Incorrect or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      await signInDemo();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong.');
    } finally {
      setDemoLoading(false);
    }
  };

  const changeNumber = () => {
    setStep('phone');
    setCode('');
    setDevCode(null);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false} keyboardShouldPersistTaps="handled">
        {/* Background */}
        <LinearGradient
          colors={['#000000', '#0A0F0A', '#050D05', '#000000']}
          locations={[0, 0.35, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Subtle green glow blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <View style={styles.blob3} />

        {/* Logo */}
        <Animated.View style={[styles.logoArea, { opacity: fadeAnim, transform: [{ scale: logoScale }] }]}>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={styles.tagline}>Your Ultimate Sports Companion</Text>
        </Animated.View>

        {/* Form card */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.card}>
            {step === 'phone' ? (
              <>
                <Text style={styles.formTitle}>Welcome</Text>
                <Text style={styles.formSubtitle}>Sign in or create an account with your phone number</Text>

                <View style={styles.inputRow}>
                  <Ionicons name="person-outline" size={18} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name (for new accounts)"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputRow}>
                  <Ionicons name="call-outline" size={18} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="+91 98765 43210"
                    placeholderTextColor={colors.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                <TouchableOpacity style={styles.mainBtn} onPress={handleSendCode} disabled={loading || demoLoading} activeOpacity={0.85}>
                  <LinearGradient
                    colors={[colors.primary, '#2D8B30', colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.mainBtnGrad}
                  >
                    {loading
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={styles.mainBtnText}>Send OTP</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.formTitle}>Enter Verification Code</Text>
                <Text style={styles.formSubtitle}>Sent to {phone}</Text>

                {devCode && (
                  <View style={styles.devBanner}>
                    <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
                    <Text style={styles.devBannerText}>Demo mode (no SMS provider wired up) — your code is {devCode}</Text>
                  </View>
                )}

                <View style={styles.inputRow}>
                  <Ionicons name="keypad-outline" size={18} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="123456"
                    placeholderTextColor={colors.textMuted}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <TouchableOpacity style={styles.mainBtn} onPress={handleVerify} disabled={loading || demoLoading} activeOpacity={0.85}>
                  <LinearGradient
                    colors={[colors.primary, '#2D8B30', colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.mainBtnGrad}
                  >
                    {loading
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={styles.mainBtnText}>Verify & Continue</Text>}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={changeNumber} style={styles.toggleRow}>
                  <Text style={styles.toggleText}>Change phone number</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Stats strip */}
            <View style={styles.statsStrip}>
              {[['12K+', 'Players'], ['350+', 'Venues'], ['5K+', 'Games']].map(([val, label]) => (
                <View key={label} style={styles.statItem}>
                  <Text style={styles.statVal}>{val}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              ))}
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Demo Mode button */}
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={handleDemo}
              disabled={loading || demoLoading}
              activeOpacity={0.85}
            >
              {demoLoading ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <>
                  <Ionicons name="flash" size={18} color={colors.primary} />
                  <Text style={styles.demoBtnText}>Explore in Demo Mode</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 22, paddingBottom: 40 },
  blob1: { position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(93,184,64,0.08)' },
  blob2: { position: 'absolute', bottom: 60, left: -100, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(109,194,64,0.06)' },
  blob3: { position: 'absolute', top: '40%', left: '30%', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(144,212,69,0.04)' },
  logoArea: { alignItems: 'center', marginBottom: 28 },
  logo: { width: 220, height: 220 },
  tagline: { fontSize: 13, color: colors.textMuted, marginTop: 4, letterSpacing: 0.3 },
  card: { borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(93,184,64,0.15)', padding: 26, backgroundColor: 'rgba(20,20,20,0.95)' },
  formTitle: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 6 },
  formSubtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 24 },
  devBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', borderRadius: 12, padding: 10, marginBottom: 16 },
  devBannerText: { color: colors.warning, fontSize: 12, flex: 1, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(93,184,64,0.12)', paddingHorizontal: 14, marginBottom: 12, gap: 10 },
  input: { flex: 1, color: colors.text, paddingVertical: 14, fontSize: 15 },
  mainBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 6, elevation: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 18 },
  mainBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  mainBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  statsStrip: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 18, marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '900', color: colors.secondary },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  toggleRow: { alignItems: 'center', paddingTop: 14 },
  toggleText: { color: colors.secondary, fontSize: 14, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  dividerText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  demoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: `${colors.primary}50`, backgroundColor: `${colors.primary}10` },
  demoBtnText: { color: colors.primary, fontSize: 15, fontWeight: '700' },
});
