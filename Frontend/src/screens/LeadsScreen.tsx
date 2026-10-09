import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LeadCard from '../components/LeadCard';
import { useLeadsSocket } from '../hooks/useLeadsSocket';
import type { ConnectionStatus } from '../hooks/useLeadsSocket';
import type { Lead } from '../types';

const STATUS_META: Record<ConnectionStatus, { label: string; color: string }> = {
  connected: { label: 'Live', color: '#16A34A' },
  connecting: { label: 'Connecting', color: '#D97706' },
  disconnected: { label: 'Offline', color: '#DC2626' },
};

const LiveBadge = ({ status }: { status: ConnectionStatus }) => {
  const meta = STATUS_META[status];
  return (
    <View style={styles.badge}>
      <Text style={[styles.badgeDot, { color: meta.color }]}>●</Text>
      <Text style={[styles.badgeLabel, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
};

const EmptyState = () => (
  <View style={styles.empty}>
    <Text style={styles.emptyTitle}>No leads yet</Text>
    <Text style={styles.emptyBody}>
      We will Submit one with Metas Lead Ads Testing Tool and it will appear here
      instantly
    </Text>
  </View>
);

const LeadsScreen = () => {
  const insets = useSafeAreaInsets();
  const {
    leads,
    status,
    isLoading,
    isMutating,
    error,
    refresh,
    removeLead,
    clearAll,
  } = useLeadsSocket();

  const renderItem = useCallback(
    ({ item }: { item: Lead }) => (
      <LeadCard lead={item} onDelete={(id) => void removeLead(id)} />
    ),
    [removeLead],
  );

  const keyExtractor = useCallback((item: Lead) => item.id, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Leads</Text>
          <Text style={styles.subtitle}>
            {leads.length} {leads.length === 1 ? 'lead' : 'leads'} · newest first
          </Text>
        </View>

        <View style={styles.headerRight}>
          <LiveBadge status={status} />

          {leads.length > 0 ? (
            <Pressable
              onPress={() => void clearAll()}
              disabled={isMutating}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear all leads"
              style={({ pressed }) => [
                styles.clearButton,
                pressed && styles.clearButtonPressed,
              ]}
            >
              <Text style={styles.clearLabel}>
                {isMutating ? '…' : 'Clear'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => void refresh()} hitSlop={8}>
            <Text style={styles.retry}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {isLoading && leads.length === 0 ? (
        <ActivityIndicator style={styles.spinner} size="large" color="#2563EB" />
      ) : (
        <FlatList
          data={leads}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={EmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => void refresh()}
              tintColor="#2563EB"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center' },
  badgeDot: { fontSize: 12, marginRight: 5 },
  badgeLabel: { fontSize: 14, fontWeight: '600' },
  clearButton: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  clearButtonPressed: {
    backgroundColor: '#FECACA',
  },
  clearLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 12,
  },
  errorText: { color: '#991B1B', fontSize: 14, flexShrink: 1, marginRight: 12 },
  retry: { color: '#991B1B', fontSize: 14, fontWeight: '700' },
  spinner: { marginTop: 40 },
  listContent: { paddingBottom: 32, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151' },
  emptyBody: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default LeadsScreen;
