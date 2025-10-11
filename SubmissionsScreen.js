import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./styles";

export default function SubmissionsScreen({
  drafts,
  submissions,
  setActiveScreen,
  setTitle,
  setContent,
  setCategory,
  setMediaUri,
  setEditingId,
  setEditingType,
  setDrafts,
}) {
  const loadDraft = (d) => {
    setActiveScreen("Post");
    setEditingId(d.id);
    setEditingType("draft");
    setTitle(d.title);
    setContent(d.content);
    setCategory(d.category);
    setMediaUri(d.mediaUri);
  };

  const editSubmission = (s) => {
    setActiveScreen("Post");
    setEditingId(s.id);
    setEditingType("submission");
    setTitle(s.title);
    setContent(s.content);
    setCategory(s.category);
    setMediaUri(s.mediaUri);
  };

  const deleteDraft = (id) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <View>
      <Text style={styles.header}>📤 Submissions & Drafts</Text>

      <View style={styles.card}>
        <Text style={styles.subHeader}>📝 Drafts</Text>
        {drafts.length === 0 ? (
          <Text style={styles.gray}>No drafts yet.</Text>
        ) : (
          drafts.map((d) => (
            <View key={d.id} style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bold}>{d.title}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <TouchableOpacity onPress={() => loadDraft(d)}>
                  <Text style={styles.link}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteDraft(d.id)}>
                  <Text style={[styles.link, { color: "#dc2626" }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.subHeader}>📑 Submitted</Text>
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
                <TouchableOpacity onPress={() => editSubmission(s)}>
                  <Text style={styles.link}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}