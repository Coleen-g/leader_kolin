import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function DashboardScreen() {
  const [counts, setCounts] = useState({ news: 0, users: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchCounts = async () => {
      setLoading(true);
      try {
        const newsSnap = await getDocs(collection(db, 'news'));
        const usersSnap = await getDocs(collection(db, 'users'));
        // categories may or may not exist in Firestore; handle gracefully
        let categoriesSnap;
        try {
          categoriesSnap = await getDocs(collection(db, 'categories'));
        } catch (e) {
          categoriesSnap = { size: 0 };
        }

        if (!mounted) return;
        setCounts({ news: newsSnap.size, users: usersSnap.size, categories: categoriesSnap.size || 0 });
      } catch (error) {
        console.error('Error fetching dashboard counts:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCounts();
    return () => { mounted = false; };
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="view-dashboard-outline" size={18} color="#fff" />
        </View>
        <View>
          <Text style={styles.header}>Admin Dashboard</Text>
          <Text style={styles.subHeader}>Overview & analytics</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ marginTop: 24 }}>
          <ActivityIndicator size="large" color="#667EEA" />
        </View>
      ) : (
        <View>
          <View style={styles.statsContainer}>
            <View style={[styles.card, { borderLeftColor: '#667EEA', borderLeftWidth: 4 }]}>
              <MaterialCommunityIcons name="newspaper-variant-outline" size={32} color="#667EEA" />
              <Text style={styles.cardTitle}>Total News</Text>
              <Text style={styles.cardValue}>{counts.news}</Text>
            </View>

            <View style={[styles.card, { borderLeftColor: '#10B981', borderLeftWidth: 4 }]}>
              <MaterialCommunityIcons name="account-group-outline" size={32} color="#10B981" />
              <Text style={styles.cardTitle}>Active Users</Text>
              <Text style={styles.cardValue}>{counts.users}</Text>
            </View>

            <View style={[styles.card, { borderLeftColor: '#F59E0B', borderLeftWidth: 4 }]}>
              <MaterialCommunityIcons name="shape-outline" size={32} color="#F59E0B" />
              <Text style={styles.cardTitle}>Categories</Text>
              <Text style={styles.cardValue}>{counts.categories}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <Text style={styles.activityItem}>• User John added new article “Campus Sports Week”</Text>
            <Text style={styles.activityItem}>• Category “Announcements” updated</Text>
            <Text style={styles.activityItem}>• 3 news posts pending approval</Text>
          </View>
        </View>
      )}
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