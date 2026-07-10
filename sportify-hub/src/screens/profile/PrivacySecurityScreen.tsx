import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { apiChangePassword } from '../../services/backendApi';

export default function PrivacySecurityScreen({ navigation }: any) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Missing fields', 'Enter your current and new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Password too short', 'New password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    try {
      await apiChangePassword(user?.uid || '', currentPassword, newPassword);
      Alert.alert('Password Updated', 'Your password has been changed.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e: any) {
      Alert.alert('Could Not Change Password', e.message || 'Please check your current password and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy & Security</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>CHANGE PASSWORD</Text>
        <GlassCard style={styles.card}>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />
          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword} disabled={saving} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>{saving ? 'Updating...' : 'Update Password'}</Text>
          </TouchableOpacity>
        </GlassCard>

        <Text style={styles.sectionTitle}>PRIVACY</Text>
        <GlassCard style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Share Location With Nearby Players</Text>
              <Text style={styles.rowDesc}>Lets Sportify Hub show you players and venues nearby</Text>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  title: { fontSize: 17, fontWeight: '800', color: colors.text },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: colors.textMuted, letterSpacing: 1.2, marginBottom: 10, marginTop: 4 },
  card: { padding: 18, marginBottom: 28 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 15 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { color: colors.text, fontSize: 14, fontWeight: '700' },
  rowDesc: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
});
