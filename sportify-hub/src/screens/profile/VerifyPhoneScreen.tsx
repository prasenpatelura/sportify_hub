import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiSendOtp, apiVerifyOtp } from '../../services/backendApi';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';

export default function VerifyPhoneScreen({ navigation }: any) {
  const { user, updateProfile } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!phone.trim()) {
      Alert.alert('Missing Number', 'Please enter your phone number.');
      return;
    }
    setLoading(true);
    try {
      await apiSendOtp(phone.trim());
      setStep('code');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not send OTP.');
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
      await apiVerifyOtp(phone.trim(), code.trim(), user?.uid);
      await updateProfile({ phone: phone.trim(), phoneVerified: true });
      Alert.alert('Verified!', 'Your phone number has been verified.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Verification Failed', e.message || 'Incorrect or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify Phone Number</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <GlassCard style={styles.card}>
            {step === 'phone' ? (
              <>
                <Ionicons name="call-outline" size={40} color={colors.secondary} style={{ marginBottom: 16, alignSelf: 'center' }} />
                <Text style={styles.title}>Enter Your Phone Number</Text>
                <Text style={styles.subtitle}>We'll send a 6-digit code to verify it's you.</Text>
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
                <TouchableOpacity style={styles.mainBtn} onPress={handleSend} disabled={loading} activeOpacity={0.85}>
                  <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>Send Code</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons name="shield-checkmark-outline" size={40} color={colors.secondary} style={{ marginBottom: 16, alignSelf: 'center' }} />
                <Text style={styles.title}>Enter Verification Code</Text>
                <Text style={styles.subtitle}>Sent to {phone}</Text>
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
                <TouchableOpacity style={styles.mainBtn} onPress={handleVerify} disabled={loading} activeOpacity={0.85}>
                  <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>Verify</Text>}
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStep('phone')} style={{ marginTop: 14, alignSelf: 'center' }}>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>Change phone number</Text>
                </TouchableOpacity>
              </>
            )}
          </GlassCard>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  card: { padding: 24 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(93,184,64,0.12)', paddingHorizontal: 14, marginBottom: 18, gap: 10 },
  input: { flex: 1, color: colors.text, paddingVertical: 14, fontSize: 15 },
  mainBtn: { borderRadius: 16, overflow: 'hidden' },
  mainBtnGrad: { paddingVertical: 15, alignItems: 'center' },
  mainBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
