import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text, Menu, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function EditUserScreen({ route, navigation }) {
  const { user } = route.params;
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleUpdate = () => {
    const updatedUser = { ...user, name, role };
    navigation.navigate('Admin', {
      screen: 'Manage Users',
      params: { updatedUser },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit User</Text>

      {/* 👤 Name Field */}
      <TextInput
        placeholder="Full Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      {/* 📋 Role Dropdown */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setMenuVisible(true)}
            style={styles.dropdownButton}
            textColor="#1E293B"
          >
            {role ? role : 'Select Role'}
          </Button>
        }
      >
        <Menu.Item onPress={() => { setRole('Administrator'); setMenuVisible(false); }} title="Administrator" />
        <Menu.Item onPress={() => { setRole('Editor'); setMenuVisible(false); }} title="Editor" />
        <Menu.Item onPress={() => { setRole('Reporter'); setMenuVisible(false); }} title="Reporter" />
      </Menu>

      {/* 💾 Save Button */}
      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}> Update User</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  header: { fontSize: 22, fontWeight: '700', color: '#1E293B', marginBottom: 24 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  dropdownButton: {
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});