import React from "react";
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const newsData = [
  {
    id: "1",
    title: "TMC Launches New Digital Library",
    date: "October 10, 2025",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
    description: "Students can now access books and journals online anytime, anywhere.",
  },
  {
    id: "2",
    title: "Campus Clean-Up Drive Successful",
    date: "October 8, 2025",
    image: "https://images.unsplash.com/photo-1581092160607-2c8e90a1a43c",
    description: "Over 200 volunteers joined the environmental initiative around the TMC campus.",
  },
  {
    id: "3",
    title: "TMC Dance Crew Wins Regional Competition",
    date: "October 6, 2025",
    image: "https://images.unsplash.com/photo-1515165562835-c4c1b235f407",
    description: "The TMC Rhythm Squad brought home the gold trophy in this year's ALCU competition.",
  },
];

export default function UserNewsScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => navigation.navigate("NewsDetail", { news: item })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>📰 Campus News</Text>
      <FlatList
        data={newsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1D4ED8",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 6,
  },
  description: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
  },
});