import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, RADIUS } from '../constants/config';
import { getBooking, Booking } from '../services/api';

// ─── Step Definitions ─────────────────────────────────────────────────────────
const LIFECYCLE_STEPS = [
  {
    key: 'Booking Confirmed',
    label: 'Booking Confirmed',
    icon: '📋',
    description: 'Your booking has been received and confirmed.',
    color: '#6C63FF',
    glow: '#6C63FF33',
  },
  {
    key: 'Provider Assigned',
    label: 'Provider Assigned',
    icon: '👤',
    description: 'A service provider has been assigned to your request.',
    color: '#FFB347',
    glow: '#FFB34733',
  },
  {
    key: 'Provider En Route',
    label: 'Provider En Route',
    icon: '🚗',
    description: 'Your provider is on the way to your location.',
    color: '#4FC3F7',
    glow: '#4FC3F733',
  },
  {
    key: 'Service Started',
    label: 'Service Started',
    icon: '🔧',
    description: 'The service has begun at your location.',
    color: '#AB47BC',
    glow: '#AB47BC33',
  },
  {
    key: 'Service In Progress',
    label: 'In Progress',
    icon: '⚡',
    description: 'Work is actively being carried out.',
    color: '#FF7043',
    glow: '#FF704333',
  },
  {
    key: 'Service Completed',
    label: 'Service Completed',
    icon: '✅',
    description: 'The service has been completed successfully.',
    color: '#00D4AA',
    glow: '#00D4AA33',
  },
  {
    key: 'Feedback Requested',
    label: 'Rate Your Experience',
    icon: '⭐',
    description: 'Please rate your experience with the provider.',
    color: '#FFD700',
    glow: '#FFD70033',
  },
];

function getStepIndex(status: string): number {
  const idx = LIFECYCLE_STEPS.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
}

// ─── Single Step Component ─────────────────────────────────────────────────────
interface StepItemProps {
  step: typeof LIFECYCLE_STEPS[0];
  status: 'done' | 'active' | 'pending';
  isLast: boolean;
  animDelay: number;
}

function StepItem({ step, status, isLast, animDelay }: StepItemProps) {
  const scaleAnim = useRef(new Animated.Value(status === 'done' ? 1 : 0.85)).current;
  const opacityAnim = useRef(new Animated.Value(status === 'pending' ? 0.35 : 1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(status === 'done' ? 1 : 0)).current;

  useEffect(() => {
    if (status === 'done') {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 50 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, tension: 60, delay: animDelay }),
      ]).start();
    } else if (status === 'active') {
      // Pulse glow for active step
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1.03, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0.85, duration: 300, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0.35, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [status]);

  const borderColor = status === 'pending' ? COLORS.border : step.color;
  const bgColor = status === 'done' ? step.glow : status === 'active' ? step.glow : 'transparent';
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] });

  return (
    <View style={styles.stepWrapper}>
      <Animated.View
        style={[
          styles.stepCard,
          { borderColor, backgroundColor: bgColor, transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}
      >
        {/* Active glow pulse overlay */}
        {status === 'active' && (
          <Animated.View
            style={[styles.glowOverlay, { borderColor: step.color, opacity: glowOpacity }]}
          />
        )}

        <View style={styles.stepLeft}>
          {/* Circle indicator */}
          <View style={[
            styles.stepCircle,
            status === 'done' && { backgroundColor: step.color, borderColor: step.color },
            status === 'active' && { borderColor: step.color, borderWidth: 2.5 },
            status === 'pending' && { borderColor: COLORS.border },
          ]}>
            {status === 'done' ? (
              <Animated.Text style={[styles.stepCheckmark, { transform: [{ scale: checkScale }] }]}>✓</Animated.Text>
            ) : (
              <Text style={[styles.stepIconInner, { opacity: status === 'active' ? 1 : 0.4 }]}>
                {step.icon}
              </Text>
            )}
          </View>

          {/* Connector line */}
          {!isLast && (
            <View style={[
              styles.connector,
              status === 'done' && { backgroundColor: step.color },
            ]} />
          )}
        </View>

        <View style={styles.stepBody}>
          <View style={styles.stepHeaderRow}>
            <Text style={[
              styles.stepLabel,
              status === 'done' && { color: step.color },
              status === 'active' && { color: step.color },
              status === 'pending' && { color: COLORS.textMuted },
            ]}>
              {step.label}
            </Text>
            {status === 'done' && (
              <View style={[styles.donePill, { backgroundColor: step.glow, borderColor: step.color }]}>
                <Text style={[styles.donePillText, { color: step.color }]}>Done</Text>
              </View>
            )}
            {status === 'active' && (
              <View style={[styles.activePill, { backgroundColor: step.glow, borderColor: step.color }]}>
                <Text style={[styles.activePillText, { color: step.color }]}>● Live</Text>
              </View>
            )}
          </View>
          {(status === 'done' || status === 'active') && (
            <Text style={[styles.stepDesc, status === 'active' && { color: COLORS.textSecondary }]}>
              {step.description}
            </Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function TrackingScreen() {
  const { bookingId, providerName, providerAvatar, serviceType } = useLocalSearchParams<{
    bookingId: string;
    providerName: string;
    providerAvatar: string;
    serviceType: string;
  }>();
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const completeAnim = useRef(new Animated.Value(0)).current;

  const fetchStatus = useCallback(async () => {
    if (!bookingId) return;
    try {
      const { booking: b } = await getBooking(bookingId);
      setBooking(b);
      const idx = getStepIndex(b.status);
      setCurrentStepIndex(idx);
      if (b.status === 'Feedback Requested') {
        setIsComplete(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
        Animated.spring(completeAnim, { toValue: 1, useNativeDriver: true, tension: 40 }).start();
      }
    } catch (_) {}
  }, [bookingId]);

  useEffect(() => {
    // Header entrance animation
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchStatus]);

  const headerTranslate = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });
  const completeScale = completeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Provider Header ── */}
        <Animated.View style={[styles.headerCard, { opacity: headerAnim, transform: [{ translateY: headerTranslate }] }]}>
          <Image
            source={{ uri: providerAvatar || 'https://i.pravatar.cc/150?u=default' }}
            style={styles.providerAvatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.providerName}>{providerName || 'Provider'}</Text>
            <Text style={styles.serviceType}>{serviceType || 'Service'}</Text>
            <View style={styles.liveRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>
                {isComplete ? 'Service Completed' : 'Live Tracking Active'}
              </Text>
            </View>
          </View>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeNum}>{Math.min(currentStepIndex + 1, LIFECYCLE_STEPS.length)}</Text>
            <Text style={styles.stepBadgeDen}>/{LIFECYCLE_STEPS.length}</Text>
          </View>
        </Animated.View>

        {/* ── Progress Bar ── */}
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            { width: `${(currentStepIndex / (LIFECYCLE_STEPS.length - 1)) * 100}%` },
          ]} />
        </View>
        <Text style={styles.progressLabel}>
          {Math.round((currentStepIndex / (LIFECYCLE_STEPS.length - 1)) * 100)}% complete
        </Text>

        {/* ── Timeline Steps ── */}
        <View style={styles.timeline}>
          {LIFECYCLE_STEPS.map((step, idx) => {
            const status: 'done' | 'active' | 'pending' =
              idx < currentStepIndex ? 'done' :
              idx === currentStepIndex ? 'active' : 'pending';
            return (
              <StepItem
                key={step.key}
                step={step}
                status={status}
                isLast={idx === LIFECYCLE_STEPS.length - 1}
                animDelay={idx * 60}
              />
            );
          })}
        </View>

        {/* ── Completion / Rating Card ── */}
        {isComplete && (
          <Animated.View style={[styles.completeCard, { transform: [{ scale: completeScale }], opacity: completeAnim }]}>
            <Text style={styles.completeEmoji}>🎉</Text>
            <Text style={styles.completeTitle}>Service Complete!</Text>
            <Text style={styles.completeSubtitle}>How was your experience with {providerName}?</Text>

            {!rated ? (
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity key={star} onPress={() => { setRating(star); setRated(true); }} activeOpacity={0.7}>
                    <Text style={[styles.star, star <= rating && styles.starFilled]}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.ratedBox}>
                <Text style={styles.ratedText}>⭐ Thanks for rating {rating}/5!</Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* ── New Search Button ── */}
        <TouchableOpacity style={styles.newSearchBtn} onPress={() => router.replace('/')} activeOpacity={0.8}>
          <Text style={styles.newSearchText}>← New Search</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16, paddingBottom: 48 },

  headerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    padding: 16, borderWidth: 1.5, borderColor: COLORS.primary,
    marginBottom: 16,
    ...Platform.select({ ios: { shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 12 }, android: { elevation: 6 } }),
  },
  providerAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.border },
  providerName: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  serviceType: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  liveText: { fontSize: 12, color: COLORS.accent, fontWeight: '600' },
  stepBadge: { flexDirection: 'row', alignItems: 'baseline' },
  stepBadgeNum: { fontSize: 28, fontWeight: '900', color: COLORS.primary },
  stepBadgeDen: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },

  progressBar: {
    height: 6, backgroundColor: COLORS.border, borderRadius: 3,
    overflow: 'hidden', marginBottom: 6,
  },
  progressFill: {
    height: 6, borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  progressLabel: { fontSize: 12, color: COLORS.textMuted, textAlign: 'right', marginBottom: 20 },

  timeline: { gap: 4 },

  stepWrapper: { marginBottom: 4 },
  stepCard: {
    flexDirection: 'row', gap: 14,
    borderRadius: RADIUS.lg, padding: 14,
    borderWidth: 1.5, overflow: 'hidden',
  },
  glowOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: RADIUS.lg, borderWidth: 1.5,
  },

  stepLeft: { alignItems: 'center', width: 44 },
  stepCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepCheckmark: { fontSize: 20, color: '#fff', fontWeight: '900' },
  stepIconInner: { fontSize: 20 },
  connector: {
    width: 2, flex: 1, minHeight: 16, marginTop: 6,
    backgroundColor: COLORS.border, borderRadius: 1,
  },

  stepBody: { flex: 1, paddingTop: 2 },
  stepHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  stepLabel: { fontSize: 14, fontWeight: '700', flex: 1 },
  donePill: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full,
    borderWidth: 1, marginLeft: 8,
  },
  donePillText: { fontSize: 11, fontWeight: '700' },
  activePill: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full,
    borderWidth: 1, marginLeft: 8,
  },
  activePillText: { fontSize: 11, fontWeight: '700' },
  stepDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },

  completeCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    padding: 24, alignItems: 'center', marginTop: 20,
    borderWidth: 1.5, borderColor: COLORS.accent,
  },
  completeEmoji: { fontSize: 52, marginBottom: 10 },
  completeTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginBottom: 6 },
  completeSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 20 },
  starsRow: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 40, color: COLORS.border },
  starFilled: { color: '#FFD700' },
  ratedBox: {
    backgroundColor: '#FFD70022', borderRadius: RADIUS.lg,
    paddingHorizontal: 24, paddingVertical: 12, borderWidth: 1, borderColor: '#FFD700',
  },
  ratedText: { fontSize: 16, color: '#FFD700', fontWeight: '700' },

  newSearchBtn: {
    marginTop: 20, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  newSearchText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
});
