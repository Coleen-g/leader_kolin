import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

export default function ManageUsersScreen({ navigation, route }) {
  const [users, setUsers] = useState([
    { id: 1, name: 'Alice Dela Cruz', role: 'Editor' },
    { id: 2, name: 'Bob Martinez', role: 'Reporter' },
    { id: 3, name: 'Catherine Reyes', role: 'Administrator' },
  ]);

  const isFocused = useIsFocused();

  // ✅ Handle Add/Edit user when screen refocuses
  useEffect(() => {
    if (route.params?.newUser) {
      setUsers((prev) => [...prev, route.params.newUser]);
      navigation.setParams({ newUser: null });
    }

    if (route.params?.updatedUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === route.params.updatedUser.id ? route.params.updatedUser : u
        )
      );
      navigation.setParams({ updatedUser: null });
    }
  }, [isFocused]);

  const removeUser = (id) => setUsers(users.filter((u) => u.id !== id));

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.avatar}>
          <Ionicons name="person-circle-outline" size={50} color="#3B82F6" />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <View style={styles.roleContainer}>
            <MaterialCommunityIcons name="account-badge" size={16} color="#64748B" />
            <Text style={styles.userRole}> {item.role}</Text>
          </View>
        </View>

        {/* ✏️ Edit */}
        <TouchableOpacity
          onPress={() => navigation.navigate('EditUser', { user: item })}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={22} color="#3B82F6" />
        </TouchableOpacity>

        {/* 🗑️ Delete */}
        <TouchableOpacity onPress={() => removeUser(item.id)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Users</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No users available.</Text>}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* ➕ Floating Add User Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddUser')}
      >
        <Ionicons name="person-add-outline" size={60} color="#2563EB" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    elevation: 3,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  avatar: { marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  roleContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  userRole: { fontSize: 13, color: '#64748B' },
  editButton: {
    padding: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 10,
    marginRight: 6,
  },
  deleteButton: {
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
  },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 40 },
  addButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    elevation: 6,
  },
});