import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default function DashboardScreen({ navigation }) {
  const [counts, setCounts] = useState({ news: 0, users: 0, categories: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      try {
        const newsSnap = await getDocs(collection(db, 'news'));
        const usersSnap = await getDocs(collection(db, 'users'));
        let categoriesSnap;
        try {
          categoriesSnap = await getDocs(collection(db, 'categories'));
        } catch (e) {
          categoriesSnap = { size: 0 };
        }
        if (!mounted) return;
        setCounts({ news: newsSnap.size, users: usersSnap.size, categories: categoriesSnap.size || 0 });

        // Fetch recent activities (latest 5 news, users, categories)
        const recent = [];
        const newsQuery = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(3));
        const newsRecent = await getDocs(newsQuery);
        newsRecent.forEach(docSnap => {
          const d = docSnap.data();
          recent.push({
            type: 'news',
            text: `News: "${d.title || 'Untitled'}" by ${d.authorName || d.authorUID || 'Unknown'}`,
            time: d.createdAt?.toDate?.() || null
          });
        });
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(2));
        const usersRecent = await getDocs(usersQuery);
        usersRecent.forEach(docSnap => {
          const d = docSnap.data();
          recent.push({
            type: 'user',
            text: `User: ${d.displayName || d.username || d.email || 'Unknown'} joined`,
            time: d.createdAt?.toDate?.() || null
          });
        });
        // Optionally, fetch recent categories
        if (categoriesSnap.size > 0) {
          const categoriesQuery = query(collection(db, 'categories'), orderBy('createdAt', 'desc'), limit(1));
          const catRecent = await getDocs(categoriesQuery);
          catRecent.forEach(docSnap => {
            const d = docSnap.data();
            recent.push({
              type: 'category',
              text: `Category: "${d.name || 'Unnamed'}" added/updated`,
              time: d.createdAt?.toDate?.() || null
            });
          });
        }
        // Sort by time descending
        recent.sort((a, b) => (b.time?.getTime?.() || 0) - (a.time?.getTime?.() || 0));
        setRecentActivities(recent.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };
    fetchDashboard();
    return () => { mounted = false; };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Just call the same logic as useEffect
      await new Promise(resolve => setTimeout(resolve, 400));
      await (async () => {
        const newsSnap = await getDocs(collection(db, 'news'));
        const usersSnap = await getDocs(collection(db, 'users'));
        let categoriesSnap;
        try {
          categoriesSnap = await getDocs(collection(db, 'categories'));
        } catch (e) {
          categoriesSnap = { size: 0 };
        }
        setCounts({ news: newsSnap.size, users: usersSnap.size, categories: categoriesSnap.size || 0 });

        // Fetch recent activities (latest 5 news, users, categories)
        const recent = [];
        const newsQuery = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(3));
        const newsRecent = await getDocs(newsQuery);
        newsRecent.forEach(docSnap => {
          const d = docSnap.data();
          recent.push({
            type: 'news',
            text: `News: "${d.title || 'Untitled'}" by ${d.authorName || d.authorUID || 'Unknown'}`,
            time: d.createdAt?.toDate?.() || null
          });
        });
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(2));
        const usersRecent = await getDocs(usersQuery);
        usersRecent.forEach(docSnap => {
          const d = docSnap.data();
          recent.push({
            type: 'user',
            text: `User: ${d.displayName || d.username || d.email || 'Unknown'} joined`,
            time: d.createdAt?.toDate?.() || null
          });
        });
        if (categoriesSnap.size > 0) {
          const categoriesQuery = query(collection(db, 'categories'), orderBy('createdAt', 'desc'), limit(1));
          const catRecent = await getDocs(categoriesQuery);
          catRecent.forEach(docSnap => {
            const d = docSnap.data();
            recent.push({
              type: 'category',
              text: `Category: "${d.name || 'Unnamed'}" added/updated`,
              time: d.createdAt?.toDate?.() || null
            });
          });
        }
        recent.sort((a, b) => (b.time?.getTime?.() || 0) - (a.time?.getTime?.() || 0));
        setRecentActivities(recent.slice(0, 5));
      })();
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={handleRefresh} 
          colors={['#667EEA']}
          tintColor="#667EEA"
        />
      }
    >
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="view-dashboard-outline" size={18} color="#fff" />
        </View>
        <View>
          <Text style={styles.header}>Admin Dashboard</Text>
          <Text style={styles.subHeader}>Overview & analytics</Text>
        </View>
      </View>

      {/* Progress Cards */}
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

      {/* Quick Actions (moved below cards) */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.dispatch(
              CommonActions.navigate({ name: 'Manage News' })
            )}
          >
            <Ionicons name="newspaper-outline" size={28} color="#667EEA" />
            <Text style={styles.quickActionText}>Manage News</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('AddEvent')}>
            <Ionicons name="calendar-plus-outline" size={28} color="#10B981" />
            <Text style={styles.quickActionText}>Add Event</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.dispatch(
              CommonActions.navigate({ name: 'Manage Users' })
            )}
          >
            <Ionicons name="people-outline" size={28} color="#F59E0B" />
            <Text style={styles.quickActionText}>Manage Users</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('Categories')}>
            <Ionicons name="pricetags-outline" size={28} color="#6366F1" />
            <Text style={styles.quickActionText}>Categories</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ marginTop: 24 }}>
          <ActivityIndicator size="large" color="#667EEA" />
        </View>
      ) : (
        <View>
          {/* Quick Actions and cards already rendered above */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            {recentActivities.length === 0 ? (
              <Text style={styles.activityItem}>No recent activities found.</Text>
            ) : (
              recentActivities.map((item, idx) => (
                <Text key={idx} style={styles.activityItem}>• {item.text}</Text>
              ))
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  header: { fontSize: 24, fontWeight: '700', color: '#1E293B', marginBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  badge: { backgroundColor: '#667EEA', borderRadius: 8, padding: 8, marginRight: 12 },
  subHeader: { color: '#64748B', fontSize: 14, marginTop: 2 },
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
  quickActionsSection: { marginTop: 10, marginBottom: 18 },
  quickActionsTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 4,
    elevation: 2,
  },
  quickActionText: { fontSize: 13, color: '#4B5563', marginTop: 6, fontWeight: '600' },
});