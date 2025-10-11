import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>

      <View style={styles.statsContainer}>
        <View style={styles.card}>
          <MaterialCommunityIcons name="newspaper-variant-outline" size={32} color="#3B82F6" />
          <Text style={styles.cardTitle}>Total News</Text>
          <Text style={styles.cardValue}>124</Text>
        </View>

        <View style={styles.card}>
          <MaterialCommunityIcons name="account-group-outline" size={32} color="#10B981" />
          <Text style={styles.cardTitle}>Active Users</Text>
          <Text style={styles.cardValue}>87</Text>
        </View>

        <View style={styles.card}>
          <MaterialCommunityIcons name="shape-outline" size={32} color="#F59E0B" />
          <Text style={styles.cardTitle}>Categories</Text>
          <Text style={styles.cardValue}>12</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        <Text style={styles.activityItem}>• User John added new article “Campus Sports Week”</Text>
        <Text style={styles.activityItem}>• Category “Announcements” updated</Text>
        <Text style={styles.activityItem}>• 3 news posts pending approval</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  header: { fontSize: 24, fontWeight: '700', color: '#1E293B', marginBottom: 20 },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardTitle: { fontSize: 14, color: '#64748B', marginTop: 8 },
  cardValue: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginTop: 4 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 10 },
  activityItem: { fontSize: 14, color: '#475569', marginBottom: 5 },
});