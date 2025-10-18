import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function EditorSettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* General Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>

        <View style={styles.settingRow}>
          <View style={styles.rowLeft}>
            <Ionicons name="notifications-outline" size={22} color="#1E293B" />
            <Text style={styles.settingText}>Enable Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            thumbColor={notifications ? "#1E3A8A" : "#CBD5E1"}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.rowLeft}>
            <Ionicons name="moon-outline" size={22} color="#1E293B" />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            thumbColor={darkMode ? "#1E3A8A" : "#CBD5E1"}
          />
        </View>
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.rowLeft}>
            <Ionicons name="key-outline" size={22} color="#1E293B" />
            <Text style={styles.settingText}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.rowLeft}>
            <Ionicons
              name="person-circle-outline"
              size={22}
              color="#1E293B"
            />
            <Text style={styles.settingText}>Update Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.rowLeft}>
            <MaterialIcons name="language" size={22} color="#1E293B" />
            <Text style={styles.settingText}>Language</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.rowLeft}>
            <Ionicons name="color-palette-outline" size={22} color="#1E293B" />
            <Text style={styles.settingText}>Theme & Fonts</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        <TouchableOpacity style={styles.dangerButton}>
          <Ionicons name="trash-outline" size={20} color="#FFF" />
          <Text style={styles.dangerText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#1E293B" },
  headerSubtitle: { fontSize: 14, color: "#64748B", marginTop: 4 },
  section: {
    marginTop: 10,
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  settingText: { marginLeft: 12, fontSize: 15, color: "#334155" },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 10,
  },
  dangerText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});