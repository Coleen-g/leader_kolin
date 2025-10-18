import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";

export default function EditorDashboardScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      {/* Welcome */}
      <Text style={styles.welcomeText}>Welcome back, Editor 👋</Text>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.cardRow}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("CreateNewsScreen")}
          >
            <MaterialIcons name="post-add" size={30} color="#1E293B" />
            <Text style={styles.cardText}>Create News</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Feather name="file-text" size={30} color="#1E293B" />
            <Text style={styles.cardText}>Drafts</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardRow}>
          <TouchableOpacity style={styles.card}>
            <Ionicons name="newspaper-outline" size={30} color="#1E293B" />
            <Text style={styles.cardText}>Published</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Ionicons name="analytics-outline" size={30} color="#1E293B" />
            <Text style={styles.cardText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Published</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 40,
    color: "#1E293B",
  },
  subText: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 20,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#FFF",
    paddingVertical: 28,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardText: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    width: "31%",
    backgroundColor: "#FFF",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
  },
  statLabel: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
});