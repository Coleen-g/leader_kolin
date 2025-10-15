import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HelpScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Need Help? 🤝</Text>
      <Text style={styles.text}>
        For any questions or technical support, please contact the TMC IT team
        at support@tmc.edu.ph.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#1E293B", marginBottom: 10 },
  text: { fontSize: 16, color: "#475569", lineHeight: 24 },
});