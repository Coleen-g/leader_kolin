import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // ✅ Added for navigation

export default function ManageNewsScreen() {
  const navigation = useNavigation(); // ✅ Initialize navigation

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const [newsList, setNewsList] = useState([
    {
      id: '1',
      title: 'Campus Sports Week Highlights',
      author: 'John Santos',
      date: 'Oct 10, 2025',
      image: 'https://picsum.photos/200/120?random=1',
      status: 'Pending',
      category: 'Event',
    },
    {
      id: '2',
      title: 'New Library Facilities Opened',
      author: 'Maria Cruz',
      date: 'Oct 09, 2025',
      image: 'https://picsum.photos/200/120?random=2',
      status: 'Approved',
      category: 'Announcement',
    },
    {
      id: '3',
      title: 'Freshmen Orientation 2025',
      author: 'Alex Tan',
      date: 'Oct 07, 2025',
      image: 'https://picsum.photos/200/120?random=3',
      status: 'Rejected',
      category: 'Orientation',
    },
  ]);

  // Filter + Search logic
  const filteredNews = newsList.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filter === 'All' || item.category === filter)
  );

  const handleAction = (id, newStatus) => {
    setNewsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          <MaterialCommunityIcons name="account-outline" size={14} color="#64748B" /> {item.author} · {item.date}
        </Text>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              item.status === 'Approved'
                ? styles.approved
                : item.status === 'Rejected'
                ? styles.rejected
                : styles.pending,
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {item.status === 'Pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.approveButton]}
              onPress={() => handleAction(item.id, 'Approved')}
            >
              <MaterialCommunityIcons name="check" size={18} color="#fff" />
              <Text style={styles.buttonText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => handleAction(item.id, 'Rejected')}
            >
              <MaterialCommunityIcons name="close" size={18} color="#fff" />
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage News</Text>

      {/* 🔍 Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#64748B" />
        <TextInput
          placeholder="Search news..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          placeholderTextColor="#94A3B8"
        />

        {/* Filter button cycles categories */}
        <TouchableOpacity
          onPress={() => {
            if (filter === 'All') setFilter('Event');
            else if (filter === 'Event') setFilter('Announcement');
            else if (filter === 'Announcement') setFilter('Orientation');
            else setFilter('All');
          }}
          style={styles.filterButton}
        >
          <Ionicons name="filter-outline" size={20} color="#2563EB" />
          <Text style={styles.filterText}>{filter}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNews}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No news found.</Text>}
      />

      {/* ➕ Create News Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateNews')} // ✅ Integrated navigation here
      >
        <Ionicons name="add-circle" size={60} color="#2563EB" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  header: { fontSize: 24, fontWeight: '700', color: '#1E293B', marginBottom: 10 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    elevation: 2,
    marginBottom: 15,
  },
  searchInput: { flex: 1, marginLeft: 6, fontSize: 14, color: '#1E293B' },
  filterButton: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  filterText: { marginLeft: 5, fontWeight: '600', color: '#2563EB' },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  image: { width: '100%', height: 120 },
  content: { padding: 12 },
  title: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 6 },
  meta: { fontSize: 13, color: '#64748B', marginBottom: 8 },
  statusContainer: { marginBottom: 8 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  approved: { backgroundColor: '#DCFCE7' },
  rejected: { backgroundColor: '#FEE2E2' },
  pending: { backgroundColor: '#FEF9C3' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 8,
  },
  approveButton: { backgroundColor: '#10B981' },
  rejectButton: { backgroundColor: '#EF4444' },
  buttonText: { color: '#fff', fontSize: 13, marginLeft: 5, fontWeight: '600' },

  // Floating button
  addButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    elevation: 6,
  },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 30 },
});