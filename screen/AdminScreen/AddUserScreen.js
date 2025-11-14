import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Text, Menu, Button } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function AddUserScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (e) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(e).toLowerCase());
  };

  const handleAddUser = async () => {
    if (!name.trim() || !email.trim() || !role) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Add user to Firebase
      const newUser = {
        name: name,
        email: email,
        role: role,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'users'), newUser);

      Alert.alert('Success', `${role} added successfully!`);
      
      // Navigate back to Manage Users
      navigation.navigate('Admin', {
        screen: 'Manage Users',
        params: { newUser },
      });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to add user');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View style={styles.badge}>
              <MaterialCommunityIcons name="account-multiple" size={18} color="#fff" />
            </View>
            <View>
              <Text style={styles.header}>Add New User</Text>
              <Text style={styles.subHeader}>Create a new user or editor account</Text>
            </View>
          </View>
        </View>

        {/* Card */}
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#667EEA' }]}>
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons name="account-outline" size={20} color="#667EEA" style={styles.inputIcon} />
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholderTextColor="#CBCBCB"
              editable={!loading}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#667EEA" style={styles.inputIcon} />
            <TextInput
              placeholder="Email Address"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#CBCBCB"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          {/* Role Dropdown */}
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={[styles.roleButton, { opacity: loading ? 0.6 : 1 }]}
                onPress={() => setMenuVisible(true)}
                disabled={loading}
              >
                <MaterialCommunityIcons name="briefcase-outline" size={20} color="#667EEA" style={styles.inputIcon} />
                <Text style={[styles.roleButtonText, !role && styles.rolePlaceholder]}>
                  {role ? role : 'Select Role'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#667EEA" />
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={() => { setRole('Editor'); setMenuVisible(false); }} title="Editor" />
            <Menu.Item onPress={() => { setRole('User'); setMenuVisible(false); }} title="User" />
          </Menu>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleAddUser}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}> Save User</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F5FF',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginBottom: 12,
    width: '100%',
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  subHeader: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1E293B',
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
  },
  roleButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  rolePlaceholder: {
    color: '#CBCBCB',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#667EEA',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#667EEA',
    fontWeight: '700',
    fontSize: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
});