import React from "react";
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function UserProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* 🔹 Profile Info */}
      <View style={styles.profileCard}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Colleen Gonzales</Text>
        <Text style={styles.email}>coleen.gonzales@tmc.edu.ph</Text>

        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil-outline" size={18} color="#fff" />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Account Settings */}
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Account Settings</Text>

        <View style={styles.settingItem}>
          <Ionicons name="notifications-outline" size={22} color="#3B82F6" />
          <Text style={styles.settingText}>Notifications</Text>
        </View>
        <View style={styles.settingItem}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#3B82F6" />
          <Text style={styles.settingText}>Privacy & Security</Text>
        </View>
        <View style={styles.settingItem}>
          <Ionicons name="help-circle-outline" size={22} color="#3B82F6" />
          <Text style={styles.settingText}>Help & Support</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#1E293B",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  profileCard: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 20,
    alignItems: "center",
    padding: 20,
    elevation: 4,
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  email: { color: "#64748B", marginBottom: 15 },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  editText: { color: "#fff", marginLeft: 5, fontWeight: "600" },
  settingsContainer: { marginHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1E293B", marginBottom: 10 },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
  },
  settingText: { marginLeft: 10, fontSize: 15, color: "#1E293B" },
});