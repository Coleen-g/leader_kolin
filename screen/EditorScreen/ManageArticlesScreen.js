import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function ManageArticlesScreen() {
  // Sample dummy data (Replace with your API or state later)
  const articles = [
    {
      id: "1",
      title: "Breaking News: Tech Innovations 2025",
      status: "Published",
      date: "Dec 10, 2024",
    },
    {
      id: "2",
      title: "Exploring Modern Media Trends",
      status: "Draft",
      date: "Dec 08, 2024",
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.articleTitle}>{item.title}</Text>
        <Text
          style={[
            styles.status,
            {
              color:
                item.status === "Published" ? "#16A34A" : "#CA8A04",
              backgroundColor:
                item.status === "Published"
                  ? "#DCFCE7"
                  : "#FEF9C3",
            },
          ]}
        >
          {item.status}
        </Text>
      </View>

      <Text style={styles.dateText}>📅 {item.date}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="edit" size={22} color="#2563EB" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="delete" size={22} color="#DC2626" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="eye-outline" size={22} color="#334155" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Manage Articles</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#64748B" />
        <TextInput
          placeholder="Search articles..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />
      </View>

      {/* Articles List */}
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No articles available</Text>
        }
      />
    </View>
  );
}

// ✅ STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#334155",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
    paddingRight: 10,
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
  },
  iconButton: {
    marginRight: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 16,
    marginTop: 30,
  },
});