import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState(['Sports', 'Events', 'Academics']);
  const [newCategory, setNewCategory] = useState('');

  const addCategory = () => {
    if (newCategory.trim() === '') return;
    setCategories([...categories, newCategory]);
    setNewCategory('');
  };

  const deleteCategory = (category) =>
    setCategories(categories.filter((c) => c !== category));

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">📰 Manage Categories</Text>

      <TextInput
        label="New Category"
        value={newCategory}
        onChangeText={setNewCategory}
        style={{ marginVertical: 10 }}
      />
      <Button mode="contained" onPress={addCategory}>Add Category</Button>

      <FlatList
        data={categories}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text>{item}</Text>
              <Button onPress={() => deleteCategory(item)}>Delete</Button>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: { marginVertical: 6 },
});