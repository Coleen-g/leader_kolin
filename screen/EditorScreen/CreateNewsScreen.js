import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function CreateNewsScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  // ✅ Save Draft Handler
  const handleSaveDraft = () => {
    if (!title.trim() && !content.trim() && !tags.trim()) {
      Alert.alert("Empty Draft", "Please add some content before saving.");
      return;
    }

    // Simulate saving draft
    Alert.alert("Draft Saved", "Your article has been saved as a draft.");
    console.log("Draft:", { title, content, tags });
  };

  // ✅ Publish Handler
  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert(
        "Missing Fields",
        "Please enter a title and content before publishing."
      );
      return;
    }

    // Simulate publishing article
    Alert.alert("Published!", "Your article has been published.");
    console.log("Published:", { title, content, tags });

    // Clear fields after publishing
    setTitle("");
    setContent("");
    setTags("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <Text style={styles.header}>New Article</Text>

        {/* Title Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter headline/title"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Content Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Content</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write your article here..."
            value={content}
            onChangeText={setContent}
            multiline
          />
        </View>

        {/* Tags Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Tags</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Campus, Sports, Announcements"
            value={tags}
            onChangeText={setTags}
          />
        </View>

        {/* Image Upload */}
        <TouchableOpacity style={styles.uploadBox}>
          <Ionicons name="image-outline" size={28} color="#64748B" />
          <Text style={styles.uploadText}>Upload Cover Image</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.draftButton} onPress={handleSaveDraft}>
            <MaterialIcons name="save-alt" size={20} color="#1E3A8A" />
            <Text style={styles.draftText}>Save Draft</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
            <Text style={styles.publishText}>Publish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F1F5F9",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
  },
  subHeader: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 8,
    borderColor: "#CBD5E1",
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    height: 160,
    textAlignVertical: "top",
  },
  uploadBox: {
    height: 150,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    marginTop: 10,
    marginBottom: 25,
  },
  uploadText: {
    marginTop: 6,
    fontSize: 15,
    color: "#475569",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  draftButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
  },
  draftText: {
    marginLeft: 6,
    color: "#1E3A8A",
    fontWeight: "600",
  },
  publishButton: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  publishText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});