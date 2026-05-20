import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, RADIUS } from '../constants/config';
import { OrchestrationResult } from '../services/api';

function ConfidenceBar({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.confRow}>
      <Text style={styles.confLabel}>{label}</Text>
      <View style={styles.confTrack}>
        <View style={[styles.confFill, { width: `${value}%` }]} />
      </View>
      <Text style={styles.confValue}>{value}%</Text>
    </View>
  );
}

function LogStep({ step, message, index }: { step: string; message: string; index: number }) {
  const icon = step.includes('Intent') ? '🧠'
    : step.includes('Discover') ? '🔍'
    : step.includes('Rank') ? '⚡'
    : step.includes('Book') ? '📅'
    : step.includes('FollowUp') || step.includes('Follow') ? '🔔'
    : step.includes('Complete') ? '✅'
    : step.includes('Error') || step.includes('Failed') ? '❌'
    : '⚙️';
  return (
    <View style={styles.logStep}>
      <View style={styles.logLeft}>
        <Text style={styles.logIcon}>{icon}</Text>
        {index < 7 && <View style={styles.logLine} />}
      </View>
      <View style={styles.logContent}>
        <Text style={styles.logStepName}>{step.replace(/_/g, ' ')}</Text>
        <Text style={styles.logMessage} numberOfLines={3}>{message}</Text>
      </View>
    </View>
  );
}

export default function OrchestrationScreen() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();

  const result: OrchestrationResult | null = useMemo(() => {
    try { return JSON.parse(data ?? ''); } catch { return null; }
  }, [data]);

  if (!result) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No result data found.</Text>
      </View>
    );
  }

  if (!result.success) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Orchestration Failed</Text>
        <Text style={styles.errorSub}>{result.error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryText}>← Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { intent, recommendedProvider: prov, confidenceMetrics, topProviders, decisionPanel, booking, logs } = result;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Intent Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧠 Detected Intent</Text>
        <View style={styles.row}>
          <View style={styles.intentBadge}><Text style={styles.intentBadgeText}>{intent.serviceType}</Text></View>
          <View style={[styles.intentBadge, styles.intentBadgeAlt]}><Text style={styles.intentBadgeAlt2}>{intent.location}</Text></View>
        </View>
        <Text style={styles.intentTime}>🕐 {intent.requestedTime}</Text>
      </View>

      {/* Confidence */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Confidence Metrics</Text>
        <ConfidenceBar label="Intent" value={confidenceMetrics.intent} />
        <ConfidenceBar label="Match" value={confidenceMetrics.match} />
        <ConfidenceBar label="Ranking" value={confidenceMetrics.ranking} />
        <ConfidenceBar label="Booking" value={confidenceMetrics.booking} />
      </View>

      {/* Recommended Provider */}
      <View style={[styles.card, styles.providerCard]}>
        <Text style={styles.cardTitle}>🏆 Best Match</Text>
        <View style={styles.providerHeader}>
          <Image source={{ uri: prov.avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.provName}>{prov.name}</Text>
            <Text style={styles.provCategory}>{prov.category}</Text>
            <View style={styles.provMeta}>
              <Text style={styles.provRating}>⭐ {prov.rating}</Text>
              <Text style={styles.provDist}>📍 {prov.distance || prov.distanceText}</Text>
              <Text style={styles.provPrice}>Rs. {prov.price}</Text>
            </View>
          </View>
          <View style={[styles.availBadge, !prov.availability && styles.unavailBadge]}>
            <Text style={styles.availText}>{prov.availability ? 'Available' : 'Busy'}</Text>
          </View>
        </View>

        {/* Score bars */}
        {prov.finalScore && (
          <View style={styles.scoreRow}>
            {[
              { label: 'Distance', val: prov.distanceScore ?? 0 },
              { label: 'Rating', val: prov.ratingScore ?? 0 },
              { label: 'Availability', val: prov.availabilityScore ?? 0 },
            ].map(s => (
              <View key={s.label} style={styles.scoreItem}>
                <Text style={styles.scoreNum}>{s.val}</Text>
                <Text style={styles.scoreLabel}>{s.label}</Text>
              </View>
            ))}
            <View style={[styles.scoreItem, styles.scoreTotal]}>
              <Text style={[styles.scoreNum, styles.scoreTotalNum]}>{prov.finalScore}</Text>
              <Text style={[styles.scoreLabel, { color: COLORS.primary }]}>Total</Text>
            </View>
          </View>
        )}

        {prov.explanation && (
          <Text style={styles.explanation}>{prov.explanation}</Text>
        )}
      </View>

      {/* AI Reasoning */}
      {result.reasoning && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💬 AI Reasoning</Text>
          <Text style={styles.reasoningText}>{result.reasoning}</Text>
        </View>
      )}

      {/* Decision Panel */}
      {decisionPanel && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚖️ Decision Panel</Text>
          <View style={styles.selectedReason}>
            <Text style={styles.selectedReasonLabel}>✅ Selected because:</Text>
            <Text style={styles.selectedReasonText}>{decisionPanel.selectedReason}</Text>
          </View>
          {decisionPanel.rejectedReasons?.map((r, i) => (
            <View key={i} style={styles.rejectedReason}>
              <Text style={styles.rejectedName}>❌ {r.name}</Text>
              <Text style={styles.rejectedText}>{r.reason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Top Providers */}
      {topProviders?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏅 Top Providers Ranked</Text>
          {topProviders.map((p, i) => (
            <View key={p._id ?? i} style={styles.topProvRow}>
              <Text style={styles.rankNum}>#{i + 1}</Text>
              <Image source={{ uri: p.avatar }} style={styles.miniAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.topProvName}>{p.name}</Text>
                <Text style={styles.topProvMeta}>⭐ {p.rating} · Rs {p.price} · {p.distance || p.distanceText}</Text>
              </View>
              <Text style={styles.finalScore}>{p.finalScore}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Booking */}
      {booking && (
        <View style={[styles.card, styles.bookingCard]}>
          <Text style={styles.cardTitle}>📅 Booking Confirmed</Text>
          <Text style={styles.bookingStatus}>Status: <Text style={styles.bookingStatusVal}>{booking.status?.toUpperCase()}</Text></Text>
          {booking.scheduledTime && <Text style={styles.bookingTime}>🕐 {booking.scheduledTime}</Text>}
          {booking.confirmationCode && (
            <View style={styles.confirmCode}>
              <Text style={styles.confirmCodeLabel}>Confirmation Code</Text>
              <Text style={styles.confirmCodeVal}>{booking.confirmationCode}</Text>
            </View>
          )}
          {/* ─ Track Live Button ─ */}
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => router.push({
              pathname: '/tracking',
              params: {
                bookingId: booking._id,
                providerName: prov.name,
                providerAvatar: prov.avatar,
                serviceType: prov.category,
              },
            })}
            activeOpacity={0.8}
          >
            <Text style={styles.trackBtnText}>📍 Track Live Workflow →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Agent Trace */}
      {logs?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔗 Agent Execution Trace</Text>
          {logs.slice().reverse().map((log, i) => (
            <LogStep key={log._id ?? i} step={log.step} message={log.message} index={i} />
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← New Search</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: COLORS.background },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  errorSub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  errorText: { fontSize: 16, color: COLORS.error },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: RADIUS.full },
  retryText: { color: COLORS.white, fontWeight: '700' },

  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },

  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  intentBadge: {
    backgroundColor: COLORS.primaryGlow, borderWidth: 1, borderColor: COLORS.primary,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full,
  },
  intentBadgeText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  intentBadgeAlt: { backgroundColor: COLORS.accentGlow, borderColor: COLORS.accent },
  intentBadgeAlt2: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
  intentTime: { color: COLORS.textSecondary, fontSize: 13, marginTop: 8 },

  confRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  confLabel: { width: 60, fontSize: 12, color: COLORS.textSecondary },
  confTrack: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  confFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  confValue: { width: 36, fontSize: 12, color: COLORS.primary, fontWeight: '700', textAlign: 'right' },

  providerCard: { borderColor: COLORS.primary, borderWidth: 1.5 },
  providerHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.border },
  provName: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  provCategory: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  provMeta: { flexDirection: 'row', gap: 10, marginTop: 6, flexWrap: 'wrap' },
  provRating: { fontSize: 12, color: COLORS.text },
  provDist: { fontSize: 12, color: COLORS.textSecondary },
  provPrice: { fontSize: 12, color: COLORS.accent, fontWeight: '700' },
  availBadge: {
    backgroundColor: '#00D4AA22', borderRadius: RADIUS.sm, paddingHorizontal: 8,
    paddingVertical: 4, borderWidth: 1, borderColor: COLORS.accent,
  },
  unavailBadge: { backgroundColor: '#FF6B6B22', borderColor: COLORS.error },
  availText: { fontSize: 11, color: COLORS.accent, fontWeight: '600' },

  scoreRow: { flexDirection: 'row', marginTop: 14, gap: 8 },
  scoreItem: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.sm,
    padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  scoreTotal: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryGlow },
  scoreNum: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  scoreTotalNum: { color: COLORS.primary },
  scoreLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, textAlign: 'center' },
  explanation: { fontSize: 13, color: COLORS.textSecondary, marginTop: 12, fontStyle: 'italic', lineHeight: 20 },

  reasoningText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },

  selectedReason: {
    backgroundColor: '#00D4AA11', borderRadius: RADIUS.sm, padding: 10,
    borderWidth: 1, borderColor: COLORS.accent, marginBottom: 8,
  },
  selectedReasonLabel: { fontSize: 12, color: COLORS.accent, fontWeight: '700', marginBottom: 4 },
  selectedReasonText: { fontSize: 13, color: COLORS.text },
  rejectedReason: { paddingVertical: 6, borderTopWidth: 1, borderTopColor: COLORS.border },
  rejectedName: { fontSize: 13, color: COLORS.error, fontWeight: '600' },
  rejectedText: { fontSize: 12, color: COLORS.textSecondary },

  topProvRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  rankNum: { fontSize: 18, fontWeight: '800', color: COLORS.primary, width: 28 },
  miniAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.border },
  topProvName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  topProvMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  finalScore: { fontSize: 20, fontWeight: '800', color: COLORS.primary },

  bookingCard: { borderColor: COLORS.accent },
  bookingStatus: { fontSize: 14, color: COLORS.textSecondary },
  bookingStatusVal: { color: COLORS.accent, fontWeight: '700' },
  bookingTime: { fontSize: 13, color: COLORS.textSecondary, marginTop: 6 },
  confirmCode: {
    marginTop: 12, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  confirmCodeLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  confirmCodeVal: { fontSize: 22, fontWeight: '800', color: COLORS.text, letterSpacing: 3, marginTop: 4 },

  logStep: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  logLeft: { alignItems: 'center', width: 32 },
  logIcon: { fontSize: 18 },
  logLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: 4, minHeight: 16 },
  logContent: { flex: 1, paddingBottom: 12 },
  logStepName: { fontSize: 12, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.3 },
  logMessage: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginTop: 2 },

  backBtn: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginTop: 8,
  },
  backBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },

  trackBtn: {
    marginTop: 14, backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg, padding: 14, alignItems: 'center',
  },
  trackBtnText: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
});
