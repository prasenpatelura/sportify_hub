import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';
import { useAuth } from '../../context/AuthContext';

export default function EditProfileScreen({ navigation }: any) {
  const { userProfile, updateProfile } = useAuth();
  const [name, setName] = useState(userProfile?.name || '');
  const [avatar, setAvatar] = useState(userProfile?.avatar || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), avatar: avatar.trim() || undefined });
      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
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
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <Image source={{ uri: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' }} style={styles.avatar} />
            <Text style={styles.avatarHint}>Paste an image URL below to change your photo</Text>
          </View>

          <GlassCard style={styles.card}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={userProfile?.username ? `@${userProfile.username}` : ''}
              editable={false}
            />

            <Text style={styles.label}>Avatar URL</Text>
            <TextInput
              style={styles.input}
              value={avatar}
              onChangeText={setAvatar}
              placeholder="https://..."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
            />
          </GlassCard>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 10 },
  avatarHint: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  card: { padding: 18, marginBottom: 24 },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 15 },
  inputDisabled: { opacity: 0.5 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
