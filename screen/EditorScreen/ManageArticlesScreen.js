import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ManageArticlesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome, Editor 👋</Text>
      <Text style={styles.subtext}>This is your managing article.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24, fontWeight: "bold", color: "#1E293B" },
  subtext: { fontSize: 16, color: "#555", marginTop: 8 },
});