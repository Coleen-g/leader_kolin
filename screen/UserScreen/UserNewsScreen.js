import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const newsData = [
  {
    id: "1",
    title: "TMC Launches New Digital Library",
    date: "October 10, 2025",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
    description:
      "Students can now access books and journals online anytime, anywhere.",
    content:
      "Trinidad Municipal College has officially launched its Digital Library initiative. This allows students and faculty to access e-books, journals, and learning materials from the comfort of their devices. The project aims to support flexible learning and provide better access to academic resources.",
  },
  {
    id: "2",
    title: "Campus Clean-Up Drive Successful",
    date: "October 8, 2025",
    image: "https://images.unsplash.com/photo-1581092160607-2c8e90a1a43c",
    description:
      "Over 200 volunteers joined the environmental initiative around the TMC campus.",
    content:
      "The Campus Clean-Up Drive, organized by the student council, gathered more than 200 students and staff. The event promoted environmental awareness and sustainability, focusing on proper waste segregation and recycling initiatives.",
  },
  {
    id: "3",
    title: "TMC Dance Crew Wins Regional Competition",
    date: "October 6, 2025",
    image: "https://images.unsplash.com/photo-1515165562835-c4c1b235f407",
    description:
      "The TMC Rhythm Squad brought home the gold trophy in this year's ALCU competition.",
    content:
      "The TMC Rhythm Squad dazzled the judges with their performance at the Regional Dance Competition. Their piece, titled 'Unity in Motion,' highlighted creativity, precision, and teamwork. The entire TMC community congratulates them for this remarkable achievement.",
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
          <MaterialCommunityIcons name="calendar" size={16} color="#999" />
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
    backgroundColor: "#F2F4F8",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0A84FF",
    marginBottom: 16,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 180,
  },
  cardContent: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginLeft: 5,
  },
  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
});