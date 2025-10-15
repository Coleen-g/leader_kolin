import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function NewsDetailScreen({ route, navigation }) {
  const { news } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: news.image }} style={styles.headerImage} />

        <View style={styles.content}>
          <Text style={styles.title}>{news.title}</Text>
          <Text style={styles.date}>{news.date}</Text>
          <Text style={styles.body}>{news.content}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerImage: {
    width: "100%",
    height: 260,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0A84FF",
    marginBottom: 6,
  },
  date: {
    fontSize: 13,
    color: "#999",
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    textAlign: "justify",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 50,
  },
});