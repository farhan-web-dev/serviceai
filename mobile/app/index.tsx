import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS } from '../constants/config';
import { orchestrate } from '../services/api';

const SUGGESTIONS = [
  'Mujhe kal subah G-13 mein AC technician chahiye',
  'I need a plumber in F-10 today',
  'Looking for an electrician in I-8 ASAP',
  'Book a beautician in G-13 this evening',
];

export default function HomeScreen() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const pulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.08, duration: 300, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const handleSend = async (query?: string) => {
    const text = query ?? message;
    if (!text.trim()) return;
    setError('');
    setLoading(true);
    pulse();
    try {
      const result = await orchestrate(text.trim());
      router.push({ pathname: '/orchestration', params: { data: JSON.stringify(result) } });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to connect: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={[styles.logoCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.logoEmoji}>🤖</Text>
          </Animated.View>
          <Text style={styles.title}>ServiceAI</Text>
          <Text style={styles.subtitle}>Your AI-Powered Service Orchestrator</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>✦ Gemini Powered</Text></View>
            <View style={[styles.badge, styles.badgeAccent]}><Text style={[styles.badgeText, styles.badgeTextAccent]}>✦ MongoDB Atlas</Text></View>
          </View>
        </View>

        {/* Chat bubble */}
        <View style={styles.bubbleCard}>
          <Text style={styles.bubbleTitle}>👋 Hello! How can I help?</Text>
          <Text style={styles.bubbleText}>
            Tell me what service you need and where. I'll find, rank, and book the best provider for you — automatically.
          </Text>
        </View>

        {/* Suggestions */}
        <Text style={styles.sectionLabel}>Try asking:</Text>
        <View style={styles.suggestions}>
          {SUGGESTIONS.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.chip}
              onPress={() => handleSend(s)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {/* Quick nav */}
        <View style={styles.quickNav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/providers')}>
            <Text style={styles.navIcon}>🏢</Text>
            <Text style={styles.navLabel}>Providers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/logs')}>
            <Text style={styles.navIcon}>📋</Text>
            <Text style={styles.navLabel}>Logs</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type your request..."
          placeholderTextColor={COLORS.textMuted}
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
          multiline
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!message.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!message.trim() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.sendIcon}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingBottom: 120 },

  header: { alignItems: 'center', paddingTop: 60, marginBottom: 28 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primaryGlow,
    borderWidth: 2, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 20, elevation: 8,
  },
  logoEmoji: { fontSize: 36 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6, textAlign: 'center' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  badge: {
    backgroundColor: COLORS.primaryGlow, borderWidth: 1, borderColor: COLORS.primary,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  badgeAccent: { backgroundColor: COLORS.accentGlow, borderColor: COLORS.accent },
  badgeText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  badgeTextAccent: { color: COLORS.accent },

  bubbleCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 24,
  },
  bubbleTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  bubbleText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },

  sectionLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  suggestions: { gap: 8, marginBottom: 24 },
  chip: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chipText: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },

  errorBox: {
    backgroundColor: '#FF6B6B22', borderRadius: RADIUS.md, padding: 12,
    borderWidth: 1, borderColor: COLORS.error, marginBottom: 16,
  },
  errorText: { color: COLORS.error, fontSize: 13 },

  quickNav: { flexDirection: 'row', gap: 12, marginTop: 8 },
  navBtn: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  navIcon: { fontSize: 24, marginBottom: 6 },
  navLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },

  inputBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    backgroundColor: COLORS.surface, padding: 16,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  input: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    paddingHorizontal: 16, paddingVertical: 12, color: COLORS.text, fontSize: 15,
    borderWidth: 1, borderColor: COLORS.border, maxHeight: 100,
  },
  sendBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6,
  },
  sendBtnDisabled: { opacity: 0.4, shadowOpacity: 0 },
  sendIcon: { fontSize: 18, color: COLORS.white },
});
