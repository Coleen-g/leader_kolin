import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./styles";

export default function PostScreen({
  title,
  setTitle,
  content,
  setContent,
  category,
  setCategory,
  mediaUri,
  setMediaUri,
  showTempMsg,
  resetForm,
  drafts,
  setDrafts,
  submissions,
  setSubmissions,
  editingId,
  editingType,
  message,
  categories,
}) {
  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission denied!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });
    if (!result.canceled) setMediaUri(result.assets[0].uri);
  };

  const saveDraft = () => {
    const id = editingId || Date.now().toString();
    const draft = { id, title, content, category, mediaUri };
    setDrafts((prev) => [draft, ...prev.filter((d) => d.id !== id)]);
    showTempMsg("💾 Draft saved!", "#16a34a");
    resetForm();
  };

  const submit = () => {
    if (!title.trim() || !content.trim() || !category) {
      showTempMsg("⚠️ All fields are required!", "#dc2626");
      return;
    }
    const id = editingId || Date.now().toString();
    const submission = {
      id,
      title,
      content,
      category,
      mediaUri,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    setSubmissions((prev) => [submission, ...prev.filter((s) => s.id !== id)]);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    showTempMsg("📤 Submitted for admin approval!", "#2563eb");
    resetForm();
  };

  return (
    <View>
      <Text style={styles.header}>📰 Create or Edit Post</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Enter title..."
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Category" value="" />
            {categories.map((cat, i) => (
              <Picker.Item key={i} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write your content here..."
          value={content}
          onChangeText={setContent}
          multiline
        />

        {mediaUri && (
          <View style={styles.mediaPreview}>
            <Image source={{ uri: mediaUri }} style={styles.mediaImage} />
            <TouchableOpacity
              onPress={() => setMediaUri(null)}
              style={styles.removeBtn}
            >
              <Text style={styles.removeBtnText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.pickBtn} onPress={pickMedia}>
          <Text style={styles.pickBtnText}>📷 Add Image / Video</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={saveDraft}>
            <Text>💾 Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.primary]}
            onPress={submit}
          >
            <Text style={styles.btnText}>📤 Submit</Text>
          </TouchableOpacity>
        </View>

        {message?.text && (
          <Text style={[styles.message, { color: message.color }]}>
            {message.text}
          </Text>
        )}
      </View>
    </View>
  );
}