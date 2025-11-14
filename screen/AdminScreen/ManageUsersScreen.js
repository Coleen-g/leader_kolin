import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, SectionList, ActivityIndicator } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function ManageUsersScreen({ navigation, route }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const isFocused = useIsFocused();

  // Fetch users from Firebase
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        firebaseId: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on mount and when screen is focused
  useEffect(() => {
    fetchUsers();
  }, [isFocused]);

  // Handle Add/Edit user when screen refocuses
  useEffect(() => {
    if (route.params?.newUser) {
      fetchUsers();
      navigation.setParams({ newUser: null });
    }

    if (route.params?.updatedUser) {
      fetchUsers();
      navigation.setParams({ updatedUser: null });
    }
  }, [isFocused, route.params?.newUser, route.params?.updatedUser]);

  // Delete user from Firestore
  const removeUser = async (firebaseId) => {
    try {
      await deleteDoc(doc(db, 'users', firebaseId));
      setUsers(users.filter((u) => u.firebaseId !== firebaseId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  // Organize users by role (exclude Admin)
  const editorUsers = users.filter((u) => u.role === 'Editor');
  const regularUsers = users.filter((u) => u.role === 'User');

  const sections = [
    { title: 'Editors', data: editorUsers, color: '#7C3AED', icon: 'pencil-box' },
    { title: 'Registered Users', data: regularUsers, color: '#667EEA', icon: 'account-multiple' },
  ];

  const renderUserCard = ({ item, sectionColor }) => (
    <Card style={[styles.card, { borderLeftColor: sectionColor, borderLeftWidth: 4 }]}>
      <View style={styles.cardContent}>
        <View style={[styles.avatar, { backgroundColor: sectionColor + '20' }]}>
          <MaterialCommunityIcons name="account-circle-outline" size={50} color={sectionColor} />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.username || item.name || 'Unknown'}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: sectionColor + '15' }]}>
            <Text style={[styles.roleBadgeText, { color: sectionColor }]}>{item.role || 'User'}</Text>
          </View>
        </View>

        {/* ✏️ Edit */}
        <TouchableOpacity
          onPress={() => navigation.navigate('EditUser', { user: item })}
          style={[styles.editButton, { backgroundColor: '#667EEA' }]}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
        </TouchableOpacity>

        {/* 🗑️ Delete */}
        <TouchableOpacity onPress={() => removeUser(item.firebaseId)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderSectionHeader = ({ section }) => (
    <View style={[styles.sectionHeader, { backgroundColor: section.color }]}>
      <MaterialCommunityIcons name={section.icon} size={22} color="#fff" />
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionCount}>
        <Text style={styles.countText}>{section.data.length}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="account-multiple" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.header}>Manage Users</Text>
            <Text style={styles.subHeader}>Total: {editorUsers.length + regularUsers.length} accounts</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.firebaseId}
          renderItem={({ item, section }) => renderUserCard({ item, sectionColor: section.color })}
          renderSectionHeader={renderSectionHeader}
          ListEmptyComponent={<Text style={styles.emptyText}>No registered users available.</Text>}
          contentContainerStyle={{ paddingBottom: 100 }}
          stickySectionHeadersEnabled={false}
        />
      )}

      {/* ➕ Floating Add User Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddUser')}
      >
        <Ionicons name="person-add-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F0F5FF', 
    paddingHorizontal: 16,
  },
  headerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 10,
    flex: 1,
  },
  sectionCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  countText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  cardContent: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 12,
  },
  avatar: { 
    borderRadius: 12,
    padding: 6,
  },
  userInfo: { 
    flex: 1,
  },
  userName: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#1E293B',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  editButton: {
    padding: 8,
    borderRadius: 10,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#94A3B8', 
    marginTop: 40,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#667EEA',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    backgroundColor: '#667EEA',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#667EEA',
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
});