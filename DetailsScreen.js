// DetailsScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function DetailsScreen({ route }) {
  const { news } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.category}>{news.category}</Text>
      <Text style={styles.title}>{news.title}</Text>
      <Text style={styles.summary}>{news.summary}</Text>
      <Text style={styles.body}>
        jsjsjsnsjksksmznnxnxdkdnxnxnxnbxbdbdjjd
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  category: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summary: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    color: "#333",
  },
});