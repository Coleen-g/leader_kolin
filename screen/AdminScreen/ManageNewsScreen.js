import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused, CommonActions } from '@react-navigation/native';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function ManageNewsScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [searchQuery, setSearchQuery] = useState('');
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch news with statuses Approved, Pending, Declined/Rejected from Firebase
  useEffect(() => {
    const newsRef = collection(db, 'news');
    // include common status spellings to be safe
    const statuses = ['Pending', 'Approved', 'Declined', 'Rejected'];
    const q = query(newsRef, where('status', 'in', statuses));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          firebaseId: doc.id,
          ...doc.data(),
        }));
        // Sort by createdAt descending
        newsData.sort((a, b) => {
          const ta = a.createdAt && a.createdAt.seconds ? a.createdAt.seconds : 0;
          const tb = b.createdAt && b.createdAt.seconds ? b.createdAt.seconds : 0;
          return tb - ta;
        });
        setNewsList(newsData);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error('Error fetching news:', error);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return unsubscribe;
  }, [isFocused, refreshKey]);

  // Filter by search query
  const filteredNews = newsList.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openNewsDetail = (item) => {
    // If the item is an event (category contains 'event') and has an eventId,
    // navigate to the EventDetail screen. Otherwise open the NewsDetail screen.
    const cat = String(item.category || '').toLowerCase();
    if (cat.includes('event') && item.eventId) {
      navigation.dispatch(
        CommonActions.navigate({ name: 'EventDetail', params: { eventId: item.eventId } })
      );
      return;
    }
    navigation.dispatch(
      CommonActions.navigate({ name: 'NewsDetail', params: { newsItem: item } })
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => openNewsDetail(item)}
    >
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />}
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.author}>{item.author || 'Unknown'}</Text>
        <Text style={styles.date}>{item.date || 'Recently'}</Text>
        {item.status && (
          <View style={[styles.statusBadge, item.status === 'Approved' ? styles.statusApproved : item.status === 'Pending' ? styles.statusPending : styles.statusDeclined]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        )}
        {item.category && (
          <TouchableOpacity
            onPress={() => {
              const cat = String(item.category || '').toLowerCase();
              if (cat.includes('event') && item.eventId) {
                navigation.dispatch(
                  CommonActions.navigate({ name: 'EventDetail', params: { eventId: item.eventId } })
                );
                return;
              }
            }}
            style={styles.categoryBadge}
          >
            <Text style={styles.categoryText}>{item.category}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage News</Text>
        <Text style={styles.headerSubtitle}>Review and approve pending articles</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#667EEA" />
        <TextInput
          placeholder="Search news..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          placeholderTextColor="#CBCBCB"
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : filteredNews.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="inbox-outline" size={48} color="#E2E8F0" />
          <Text style={styles.emptyText}>No pending news</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNews}
          renderItem={renderItem}
          keyExtractor={(item) => item.firebaseId}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); setRefreshKey(k => k + 1); }}
        />
      )}

      {/* Floating Create (+) button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateNews')}
        activeOpacity={0.9}
      >
        <View style={styles.fabInner}>
          <MaterialCommunityIcons name="plus" size={28} color="#fff" />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: '#94A3B8' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 12, fontSize: 16, color: '#94A3B8' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6EEF8',
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#0F172A' },

  // Card styles
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
  },
  cardImage: { width: 80, height: 80, borderRadius: 8 },
  cardContent: { marginLeft: 12, flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  author: { fontSize: 12, color: '#64748B', marginBottom: 2 },
  date: { fontSize: 11, color: '#94A3B8', marginBottom: 6 },
  categoryBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  categoryText: { color: '#7C3AED', fontSize: 11, fontWeight: '700' },
  statusBadge: { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  statusApproved: { backgroundColor: '#10B981' },
  statusPending: { backgroundColor: '#F59E0B' },
  statusDeclined: { backgroundColor: '#EF4444' },
  
  /* Floating action button */
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    zIndex: 50,
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
});