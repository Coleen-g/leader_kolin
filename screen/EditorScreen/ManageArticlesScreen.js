import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator, Modal, ScrollView, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { db, auth } from '../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';

export default function ManageArticlesScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [searchQuery, setSearchQuery] = useState('');
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch articles with selected status (Pending/Approved) authored by the current editor
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) {
      setNewsList([]);
      setLoading(false);
      return;
    }

    const newsRef = collection(db, 'news');
    const q = query(newsRef, where('status', '==', filterStatus), where('authorUID', '==', u.uid));
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
        console.error('Error fetching articles:', error);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return unsubscribe;
  }, [isFocused, filterStatus, refreshKey]);

  // Filter by search query
  const filteredNews = newsList.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openNewsDetail = (item) => {
    setSelectedNews(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedNews(null);
  };

  const handleAction = async (id, newStatus) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'news', id), { status: newStatus });
      closeModal();
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Failed to update article');
    } finally {
      setUpdating(false);
    }
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
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Manage Articles</Text>
          <Text style={styles.headerSubtitle}>Your {filterStatus} submissions</Text>
        </View>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateNews')}
        >
          <MaterialCommunityIcons name="plus-circle" size={28} color="#667EEA" />
        </TouchableOpacity>
      </View>

      {/* Filter Toggle */}
      <View style={styles.filterRow}>
        {['Pending', 'Approved'].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterButton, filterStatus === s && styles.filterButtonActive]}
            onPress={() => { setFilterStatus(s); setLoading(true); }}
          >
            <Text style={[styles.filterText, filterStatus === s && styles.filterTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#667EEA" />
        <TextInput
          placeholder="Search articles..."
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
          <MaterialCommunityIcons name="newspaper-outline" size={48} color="#E2E8F0" />
          <Text style={styles.emptyText}>No {filterStatus} articles</Text>
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

      {/* Modal to show full article */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="chevron-back" size={28} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Article</Text>
            <View style={{ width: 28 }} />
          </View>

          {selectedNews && (
            <ScrollView style={styles.modalScroll} contentContainerStyle={{ paddingBottom: 20 }}>
              {selectedNews.imageUrl && (
                <Image source={{ uri: selectedNews.imageUrl }} style={styles.modalImage} />
              )}

              <View style={styles.modalBody}>
                <Text style={styles.modalNewsTitle}>{selectedNews.title}</Text>

                <View style={styles.modalMeta}>
                  <Text style={styles.modalAuthor}>{selectedNews.author || 'Unknown'}</Text>
                  <Text style={styles.modalDate}>{selectedNews.date || 'Recently'}</Text>
                </View>

                {selectedNews.category && (
                  <View style={styles.categoryBadgeModal}>
                    <Text style={styles.categoryTextModal}>{selectedNews.category}</Text>
                  </View>
                )}

                <Text style={styles.modalContentText}>
                  {selectedNews.content}
                </Text>
              </View>

              {selectedNews.status === 'Pending' ? (
                // Show action buttons only for Pending items
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => handleAction(selectedNews.firebaseId, 'Declined')}
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="close-circle-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Decline</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleAction(selectedNews.firebaseId, 'Approved')}
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="check-circle-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Approve</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                // Read-only status badge for non-pending items
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Status:</Text>
                  <View style={[styles.statusBadge, selectedNews.status === 'Approved' ? styles.statusApproved : styles.statusDeclined]}>
                    <Text style={styles.statusText}>{selectedNews.status || 'Unknown'}</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: '#94A3B8' },
  createButton: { paddingTop: 4 },
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

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  modalScroll: { flex: 1 },
  modalImage: { width: '100%', height: 240 },
  modalBody: { paddingHorizontal: 16, paddingTop: 16 },
  modalNewsTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  modalMeta: { flexDirection: 'row', marginBottom: 12, alignItems: 'center' },
  modalAuthor: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginRight: 12 },
  modalDate: { fontSize: 12, color: '#94A3B8' },
  categoryBadgeModal: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
  categoryTextModal: { color: '#7C3AED', fontSize: 12, fontWeight: '700' },
  modalContentText: { fontSize: 15, lineHeight: 22, color: '#475569' },
  actionButtons: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8 },
  declineButton: { backgroundColor: '#EF4444' },
  approveButton: { backgroundColor: '#10B981' },
  actionButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 18 },
  statusLabel: { fontSize: 14, color: '#64748B', marginRight: 8, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusApproved: { backgroundColor: '#ECFDF5' },
  statusDeclined: { backgroundColor: '#FFF1F2' },
  statusText: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6EEF8' },
  filterButtonActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  filterText: { color: '#475569', fontWeight: '700' },
  filterTextActive: { color: '#fff' },
});