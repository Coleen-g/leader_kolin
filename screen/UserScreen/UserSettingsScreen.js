import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

export default function UserSettingsScreen() {
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings ⚙️</Text>
      <View style={styles.option}>
        <Text style={styles.optionText}>Enable Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#1E293B", marginBottom: 20 },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  optionText: { fontSize: 16, color: "#334155" },
});