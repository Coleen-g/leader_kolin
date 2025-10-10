import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

export default function EditorReporterComponent() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [drafts, setDrafts] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [mediaUri, setMediaUri] = useState(null);

  // Load stored data
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedDrafts = await AsyncStorage.getItem("drafts");
        const storedSubs = await AsyncStorage.getItem("submissions");
        if (storedDrafts) setDrafts(JSON.parse(storedDrafts));
        if (storedSubs) setSubmissions(JSON.parse(storedSubs));
      } catch (e) {
        console.log("Load error", e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("drafts", JSON.stringify(drafts));
  }, [drafts]);

  useEffect(() => {
    AsyncStorage.setItem("submissions", JSON.stringify(submissions));
  }, [submissions]);

  const showTempMsg = (txt) => {
    setMessage(txt);
    setTimeout(() => setMessage(""), 2000);
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("General");
    setEditingId(null);
    setMediaUri(null);
  };

  // 📷 Pick image or video
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

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const saveDraft = () => {
    const id = editingId || Date.now().toString();
    const draft = {
      id,
      title,
      content,
      category,
      mediaUri,
      updatedAt: new Date().toISOString(),
    };

    setDrafts((prev) => [draft, ...prev.filter((d) => d.id !== id)]);
    showTempMsg("💾 Draft saved!");
    resetForm();
  };

  const submit = (immediate = false) => {
    if (!title.trim() || !content.trim()) {
      showTempMsg("⚠️ Title and content required!");
      return;
    }

    const id = editingId || Date.now().toString();
    const sub = {
      id,
      title,
      content,
      category,
      mediaUri,
      status: immediate ? "approved" : "pending",
      submittedAt: new Date().toISOString(),
    };

    setSubmissions((prev) => [sub, ...prev.filter((s) => s.id !== id)]);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    showTempMsg(immediate ? "✅ Published!" : "📤 Submitted for approval!");
    resetForm();
  };

  const loadDraft = (d) => {
    setEditingId(d.id);
    setTitle(d.title);
    setContent(d.content);
    setCategory(d.category);
    setMediaUri(d.mediaUri);
  };

  const deleteDraft = (id) => {
    Alert.alert("Delete draft?", "This cannot be undone.", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: () => {
          setDrafts((prev) => prev.filter((d) => d.id !== id));
          showTempMsg("🗑️ Draft deleted!");
        },
      },
    ]);
  };

  const mockApprove = (id, status) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s
      )
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>🗞️ Editor / Reporter Panel</Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write your content..."
            value={content}
            onChangeText={setContent}
            multiline
          />

          {/* 📷 Media Preview */}
          {mediaUri && (
            <View style={{ alignItems: "center", marginVertical: 8 }}>
              <Image
                source={{ uri: mediaUri }}
                style={{ width: 220, height: 150, borderRadius: 8 }}
              />
              <TouchableOpacity
                onPress={() => setMediaUri(null)}
                style={styles.removeBtn}
              >
                <Text style={{ color: "#fff" }}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.pickBtn} onPress={pickMedia}>
            <Text style={{ color: "#fff" }}>📷 Pick Image or Video</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity style={styles.btn} onPress={saveDraft}>
              <Text>Save Draft</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.primary]}
              onPress={() => submit(false)}
            >
              <Text style={styles.btnText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.success]}
              onPress={() => submit(true)}
            >
              <Text style={styles.btnText}>Submit & Publish</Text>
            </TouchableOpacity>
          </View>

          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>

        {/* DRAFT LIST */}
        <View style={styles.card}>
          <Text style={styles.subHeader}>📝 Drafts</Text>
          {drafts.length === 0 ? (
            <Text style={styles.gray}>No drafts yet.</Text>
          ) : (
            drafts.map((d) => (
              <View key={d.id} style={styles.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bold}>{d.title}</Text>
                  {d.mediaUri && (
                    <Image
                      source={{ uri: d.mediaUri }}
                      style={{ width: 60, height: 40, borderRadius: 4 }}
                    />
                  )}
                </View>
                <View>
                  <TouchableOpacity onPress={() => loadDraft(d)}>
                    <Text style={styles.link}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteDraft(d.id)}>
                    <Text style={[styles.link, { color: "red" }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* SUBMISSIONS */}
        <View style={styles.card}>
          <Text style={styles.subHeader}>📤 Submissions</Text>
          {submissions.length === 0 ? (
            <Text style={styles.gray}>No submissions yet.</Text>
          ) : (
            submissions.map((s) => (
              <View key={s.id} style={styles.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bold}>{s.title}</Text>
                  <Text style={styles.small}>
                    {s.category} • {new Date(s.submittedAt).toLocaleString()}
                  </Text>
                  {s.mediaUri && (
                    <Image
                      source={{ uri: s.mediaUri }}
                      style={{ width: 60, height: 40, borderRadius: 4 }}
                    />
                  )}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={[
                      styles.status,
                      s.status === "approved"
                        ? styles.approved
                        : s.status === "rejected"
                        ? styles.rejected
                        : styles.pending,
                    ]}
                  >
                    {s.status}
                  </Text>
                  <TouchableOpacity onPress={() => mockApprove(s.id, "approved")}>
                    <Text style={styles.link}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => mockApprove(s.id, "rejected")}>
                    <Text style={[styles.link, { color: "red" }]}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  btn: {
    backgroundColor: "#e5e5e5",
    padding: 8,
    borderRadius: 6,
    margin: 3,
  },
  pickBtn: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  removeBtn: {
    backgroundColor: "red",
    padding: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  primary: { backgroundColor: "#2563eb" },
  success: { backgroundColor: "#16a34a" },
  btnText: { color: "#fff" },
  row: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  message: { marginTop: 8, color: "green" },
  gray: { color: "gray" },
  bold: { fontWeight: "600" },
  link: { color: "#2563eb", marginVertical: 2 },
  small: { fontSize: 12, color: "gray" },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  status: { padding: 4, borderRadius: 4, fontSize: 12, textTransform: "capitalize" },
  approved: { backgroundColor: "#dcfce7", color: "#166534" },
  rejected: { backgroundColor: "#fee2e2", color: "#7f1d1d" },
  pending: { backgroundColor: "#fef3c7", color: "#78350f" },
});