import React from "react";
import {
View,
Text,
StyleSheet,
TouchableOpacity,
FlatList,
SafeAreaView,
StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // ✅ Correct import for Expo

export default function EditorDashboardScreen() {
const stats = [
{ id: "1", label: "Pending Articles", count: 8, icon: "time-outline", color: "#F59E0B" },
{ id: "2", label: "Published", count: 42, icon: "newspaper-outline", color: "#10B981" },
{ id: "3", label: "Rejected", count: 5, icon: "close-circle-outline", color: "#EF4444" },
];

const quickActions = [
{ id: "1", label: "Create News", icon: "create-outline" },
{ id: "2", label: "Manage Drafts", icon: "document-text-outline" },
{ id: "3", label: "Review Submissions", icon: "eye-outline" },
];

return (
<SafeAreaView style={styles.safeArea}>
<StatusBar barStyle="dark-content" />
<View style={styles.header}>
<Text style={styles.greeting}>Welcome back, Editor 👋</Text>
<Text style={styles.subtext}>Manage and publish campus stories</Text>
</View>

  <View style={styles.statsContainer}>
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={stats}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={[styles.statCard, { borderColor: item.color }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
          <Text style={styles.statCount}>{item.count}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </View>
      )}
    />
  </View>

  <Text style={styles.sectionTitle}>Quick Actions</Text>

  <View style={styles.actionsContainer}>
    {quickActions.map((action) => (
      <TouchableOpacity key={action.id} style={styles.actionButton}>
        <Ionicons name={action.icon} size={24} color="#2563EB" />
        <Text style={styles.actionText}>{action.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
</SafeAreaView>

);
}

const styles = StyleSheet.create({
safeArea: {
flex: 1,
backgroundColor: "#F8FAFC",
paddingHorizontal: 16,
},
header: {
marginTop: 20,
marginBottom: 10,
},
greeting: {
fontSize: 22,
fontWeight: "700",
color: "#1E293B",
},
subtext: {
color: "#64748B",
fontSize: 15,
marginTop: 4,
},
statsContainer: {
marginTop: 20,
},
statCard: {
backgroundColor: "#fff",
padding: 16,
borderRadius: 16,
alignItems: "center",
justifyContent: "center",
marginRight: 12,
borderWidth: 1.5,
width: 130,
},
statCount: {
fontSize: 22,
fontWeight: "bold",
marginTop: 6,
color: "#0F172A",
},
statLabel: {
fontSize: 13,
color: "#475569",
marginTop: 2,
},
sectionTitle: {
fontSize: 18,
fontWeight: "600",
marginTop: 28,
marginBottom: 10,
color: "#1E293B",
},
actionsContainer: {
backgroundColor: "#fff",
borderRadius: 16,
paddingVertical: 8,
paddingHorizontal: 12,
elevation: 1,
},
actionButton: {
flexDirection: "row",
alignItems: "center",
paddingVertical: 12,
borderBottomWidth: 1,
borderBottomColor: "#E2E8F0",
},
actionText: {
marginLeft: 10,
fontSize: 16,
color: "#1E40AF",
fontWeight: "500",
},
});