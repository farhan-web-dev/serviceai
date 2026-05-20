import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { COLORS, RADIUS } from '../constants/config';
import { getLogs, WorkflowLog } from '../services/api';

function stepIcon(step: string) {
  if (step.includes('Intent')) return '🧠';
  if (step.includes('Discover')) return '🔍';
  if (step.includes('Rank')) return '⚡';
  if (step.includes('Book')) return '📅';
  if (step.includes('FollowUp') || step.includes('Follow')) return '🔔';
  if (step.includes('Complete')) return '✅';
  if (step.includes('Error') || step.includes('Failed')) return '❌';
  if (step.includes('Init') || step.includes('Plan')) return '🚀';
  return '⚙️';
}

function stepColor(step: string): string {
  if (step.includes('Error') || step.includes('Failed')) return COLORS.error;
  if (step.includes('Complete')) return COLORS.accent;
  if (step.includes('Init') || step.includes('Plan')) return COLORS.primary;
  return COLORS.textSecondary;
}

export default function LogsScreen() {
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getLogs();
      setLogs(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: WorkflowLog }) => {
    const date = new Date(item.createdAt);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const color = stepColor(item.step);
    return (
      <View style={styles.logCard}>
        <View style={styles.logLeft}>
          <Text style={styles.icon}>{stepIcon(item.step)}</Text>
          <View style={[styles.dot, { backgroundColor: color }]} />
        </View>
        <View style={styles.logBody}>
          <View style={styles.logHeader}>
            <Text style={[styles.stepName, { color }]} numberOfLines={1}>
              {item.step.replace(/_/g, ' ')}
            </Text>
            <Text style={styles.time}>{timeStr}</Text>
          </View>
          <Text style={styles.message} numberOfLines={4}>{item.message}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>{logs.length} recent events</Text>
        <TouchableOpacity onPress={loadLogs} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading logs...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadLogs}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No logs yet. Run a query first!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  topBarTitle: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  refreshBtn: {
    backgroundColor: COLORS.primaryGlow, borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.primary,
  },
  refreshText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },

  list: { padding: 16, paddingBottom: 40 },
  logCard: {
    flexDirection: 'row', gap: 12, backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    padding: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8,
  },
  logLeft: { alignItems: 'center', gap: 4, paddingTop: 2 },
  icon: { fontSize: 20 },
  dot: { width: 6, height: 6, borderRadius: 3 },

  logBody: { flex: 1 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  stepName: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3, flex: 1 },
  time: { fontSize: 11, color: COLORS.textMuted, marginLeft: 8 },
  message: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },

  loadingText: { fontSize: 14, color: COLORS.textSecondary },
  errorText: { fontSize: 14, color: COLORS.error, textAlign: 'center' },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center' },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: RADIUS.full },
  retryText: { color: COLORS.white, fontWeight: '700' },
});
