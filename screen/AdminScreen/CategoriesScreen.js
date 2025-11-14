import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, TextInput, Button, Card, IconButton, Portal, Dialog } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query } from 'firebase/firestore';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch categories from Firestore on mount
  useEffect(() => {
    const categoriesRef = collection(db, 'categories');
    const unsubscribe = onSnapshot(
      query(categoriesRef),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setCategories(data);
      },
      (error) => {
        console.error('Error fetching categories:', error);
        Alert.alert('Error', 'Failed to load categories');
      }
    );
    return unsubscribe;
  }, []);

  const addCategory = async () => {
    const trimmed = newCategory.trim();
    if (trimmed === '') {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'categories'), {
        name: trimmed,
        createdAt: new Date(),
      });
      setNewCategory('');
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
      Alert.alert('Error', 'Failed to delete category');
    }
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setEditValue(category.name);
  };

  const saveEdit = async () => {
    const trimmed = editValue.trim();
    if (trimmed === '') {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }

    try {
      await updateDoc(doc(db, 'categories', editingCategory.id), {
        name: trimmed,
      });
      setEditingCategory(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Failed to update category');
    }
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditValue('');
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryText}>{item.name}</Text>
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => openEdit(item)}
              containerColor="#7C3AED20"
              iconColor="#7C3AED"
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => deleteCategory(item.id)}
              containerColor="#FF000020"
              iconColor="#EF4444"
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#fff" />
        </View>
        <Text style={styles.header}>Manage Categories</Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="New Category"
          value={newCategory}
          onChangeText={setNewCategory}
          style={styles.input}
          mode="outlined"
        />
        <Button mode="contained" onPress={addCategory} style={styles.addButton}>
          Add
        </Button>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item, i) => i.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8 }}
      />

      <Portal>
        <Dialog visible={!!editingCategory} onDismiss={cancelEdit}>
          <Dialog.Title>Edit Category</Dialog.Title>
          <Dialog.Content>
            <TextInput
              placeholder="Category name"
              value={editValue}
              onChangeText={setEditValue}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelEdit}>Cancel</Button>
            <Button onPress={saveEdit}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8FAFF' },
  header: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  input: { flex: 1, marginRight: 10, backgroundColor: '#fff' },
  addButton: { height: 48, justifyContent: 'center' },
  card: { marginVertical: 6, borderRadius: 10, elevation: 2 },
  cardContent: { paddingVertical: 12 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryText: { fontSize: 16, color: '#0F172A' },
  actions: { flexDirection: 'row' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
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