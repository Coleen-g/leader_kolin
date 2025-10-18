import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function EditorProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/219/219983.png",
          }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileRole}>Senior Media Editor</Text>
        </View>

        <TouchableOpacity style={styles.editIcon}>
          <MaterialIcons name="edit" size={24} color="#1E3A8A" />
        </TouchableOpacity>
      </View>

      {/* Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>

        <View style={styles.detailCard}>
          <Ionicons
            name="mail-outline"
            size={22}
            color="#1E293B"
            style={styles.icon}
          />
          <Text style={styles.detailText}>john.doe@example.com</Text>
        </View>

        <View style={styles.detailCard}>
          <Ionicons
            name="call-outline"
            size={22}
            color="#1E293B"
            style={styles.icon}
          />
          <Text style={styles.detailText}>+1 234 567 890</Text>
        </View>

        <View style={styles.detailCard}>
          <Ionicons
            name="briefcase-outline"
            size={22}
            color="#1E293B"
            style={styles.icon}
          />
          <Text style={styles.detailText}>Department: Digital Media</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Change Password</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  header: { paddingTop: 40, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#1E293B" },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 20,
  },
  profileImage: { width: 70, height: 70, borderRadius: 35 },
  profileInfo: { marginLeft: 16, flex: 1 },
  profileName: { fontSize: 20, fontWeight: "700", color: "#1E293B" },
  profileRole: { fontSize: 14, color: "#64748B", marginTop: 2 },
  editIcon: { padding: 4 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 10,
  },
  detailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  icon: { marginRight: 12 },
  detailText: { fontSize: 15, color: "#475569" },
  buttonsContainer: { marginTop: 10 },
  primaryButton: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  secondaryButton: {
    backgroundColor: "#E2E8F0",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#1E293B",
    fontSize: 16,
    fontWeight: "600",
  },
});