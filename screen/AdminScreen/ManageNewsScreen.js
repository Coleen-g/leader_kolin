import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator, Modal, ScrollView, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';

export default function ManageNewsScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [searchQuery, setSearchQuery] = useState('');
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

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
      },
      (error) => {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [isFocused]);

  // Filter by search query
  const filteredNews = newsList.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openNewsDetail = (item) => {
    // If it's an event, go directly to EventDetail screen
    if (item.eventId) {
      navigation.navigate('EventDetail', { eventId: item.eventId });
    } else {
      // Otherwise show modal for regular news
      setSelectedNews(item);
      setModalVisible(true);
    }
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
      console.error('Error updating news:', error);
      alert('Failed to update news');
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
        {item.status && (
          <View style={[styles.statusBadge, item.status === 'Approved' ? styles.statusApproved : item.status === 'Pending' ? styles.statusPending : styles.statusDeclined]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        )}
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

              {/* Action buttons - only show for regular news, not events */}
              {!selectedNews.eventId && (
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
              )}

              {/* View Event button - show for events */}
              {selectedNews.eventId && (
              <TouchableOpacity
                style={styles.viewEventButton}
                onPress={() => {
                  closeModal();
                  navigation.navigate('EventDetail', { eventId: selectedNews.eventId });
                }}
              >
                <MaterialCommunityIcons name="calendar-check" size={20} color="#fff" />
                <Text style={styles.viewEventButtonText}>View Event Details</Text>
              </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

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
  viewEventButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 14, marginTop: 16, gap: 8 },
  viewEventButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
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