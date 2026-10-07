import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Lead } from '../types';

interface Props {
  lead: Lead;
}

const formatTime = (ms: number): string =>
  new Date(ms).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const LeadCard = ({ lead }: Props) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.name}>{lead.name}</Text>
      <Text style={styles.time}>{formatTime(lead.createdAt)}</Text>
    </View>

    {lead.email ? <Text style={styles.detail}>{lead.email}</Text> : null}
    {lead.phone ? <Text style={styles.detail}>{lead.phone}</Text> : null}

    {lead.incomplete ? (
      <View style={styles.warning}>
        <Text style={styles.warningText}>
          Incomplete — {lead.error ?? 'fields unavailable'}
        </Text>
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    flexShrink: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 13,
    color: '#6B7280',
  },
  detail: {
    fontSize: 15,
    color: '#374151',
    marginTop: 2,
  },
  warning: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
  },
});

export default memo(LeadCard);