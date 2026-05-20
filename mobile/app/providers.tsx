import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, TextInput, Image,
} from 'react-native';
import { COLORS, RADIUS } from '../constants/config';
import { getProviders, Provider } from '../services/api';

const CATEGORIES = ['All', 'AC Technician', 'Plumber', 'Electrician', 'Beautician', 'Tutor'];

export default function ProvidersScreen() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filtered, setFiltered] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    let list = providers;
    if (selectedCat !== 'All') list = list.filter(p => p.category === selectedCat);
    if (search.trim()) list = list.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [providers, selectedCat, search]);

  const loadProviders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProviders();
      setProviders(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Provider }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
        <View style={[styles.availBadge, !item.availability && styles.unavailBadge]}>
          <Text style={[styles.availText, !item.availability && { color: COLORS.error }]}>
            {item.availability ? '● Available' : '● Busy'}
          </Text>
        </View>
      </View>
      <View style={styles.meta}>
        <View style={styles.metaItem}><Text style={styles.metaIcon}>⭐</Text><Text style={styles.metaVal}>{item.rating}</Text></View>
        <View style={styles.metaItem}><Text style={styles.metaIcon}>📍</Text><Text style={styles.metaVal}>{item.location}</Text></View>
        <View style={styles.metaItem}><Text style={styles.metaIcon}>🚗</Text><Text style={styles.metaVal}>{item.distance}</Text></View>
        <View style={styles.metaItem}><Text style={styles.metaIcon}>💰</Text><Text style={[styles.metaVal, { color: COLORS.accent }]}>Rs {item.price}</Text></View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or location..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={i => i}
        contentContainerStyle={styles.catList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, selectedCat === item && styles.catChipActive]}
            onPress={() => setSelectedCat(item)}
          >
            <Text style={[styles.catText, selectedCat === item && styles.catTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Count */}
      <Text style={styles.countText}>{filtered.length} providers found</Text>

      {/* List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading providers...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadProviders}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No providers found</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.card, margin: 16, borderRadius: RADIUS.lg,
    padding: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14 },

  catList: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  catChip: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.full,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  catTextActive: { color: COLORS.white },

  countText: { fontSize: 12, color: COLORS.textMuted, paddingHorizontal: 16, marginBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },

  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.border },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  category: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  availBadge: { backgroundColor: COLORS.accentGlow, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
  unavailBadge: { backgroundColor: '#FF6B6B22' },
  availText: { fontSize: 11, color: COLORS.accent, fontWeight: '600' },

  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaIcon: { fontSize: 12 },
  metaVal: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },

  loadingText: { fontSize: 14, color: COLORS.textSecondary },
  errorText: { fontSize: 14, color: COLORS.error, textAlign: 'center' },
  emptyText: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', marginTop: 48 },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: RADIUS.full },
  retryText: { color: COLORS.white, fontWeight: '700' },
});
