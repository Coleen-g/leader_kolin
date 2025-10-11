import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CreateNewsScreen({ navigation }) {
  const [newsData, setNewsData] = useState({
    title: '',
    author: '',
    category: '',
    image: '',
    content: '',
  });

  const handleChange = (field, value) => {
    setNewsData({ ...newsData, [field]: value });
  };

  const handleSubmit = () => {
    const { title, author, category, image, content } = newsData;
    if (!title || !author || !category || !image || !content) {
      Alert.alert('Missing Fields', 'Please fill in all fields before submitting.');
      return;
    }

    // 🧠 Later: send data to backend API (Laravel or Firebase)
    Alert.alert('Success', 'News article created successfully!');
    setNewsData({ title: '', author: '', category: '', image: '', content: '' });
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>Create News</Text>

      {/* Title */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter news title"
          value={newsData.title}
          onChangeText={(value) => handleChange('title', value)}
        />
      </View>

      {/* Author */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Author</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter author name"
          value={newsData.author}
          onChangeText={(value) => handleChange('author', value)}
        />
      </View>

      {/* Category */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Announcement, Event, Orientation"
          value={newsData.category}
          onChangeText={(value) => handleChange('category', value)}
        />
      </View>

      {/* Image URL */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Image URL</Text>
        <TextInput
          style={styles.input}
          placeholder="Paste image link (https://...)"
          value={newsData.image}
          onChangeText={(value) => handleChange('image', value)}
        />
      </View>

      {/* Content */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Content</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write the content of the news..."
          multiline
          numberOfLines={6}
          value={newsData.content}
          onChangeText={(value) => handleChange('content', value)}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Ionicons name="paper-plane-outline" size={20} color="#fff" />
        <Text style={styles.submitText}>Publish News</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  header: { fontSize: 24, fontWeight: '700', color: '#1E293B', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
    elevation: 2,
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    elevation: 3,
    marginTop: 10,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 6 },
});