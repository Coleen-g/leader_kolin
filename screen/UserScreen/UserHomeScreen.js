import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { Ionicons } from "@expo/vector-icons";

export default function UserHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 🔹 Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome Back 👋</Text>
          <Text style={styles.subHeader}>Stay updated with campus happenings!</Text>
        </View>

        {/* 🔹 Featured Banner */}
        <View style={styles.banner}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1584697964403-83b3e6e36b93?auto=format&fit=crop&w=800&q=60",
            }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>InsideTMC News</Text>
            <Text style={styles.bannerSubtitle}>Your Campus. Your Stories.</Text>
          </View>
        </View>

        {/* 🔹 Quick Access */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickAccessContainer}>
          <View style={styles.accessCard}>
            <Ionicons name="book-outline" size={28} color="#3B82F6" />
            <Text style={styles.accessText}>Courses</Text>
          </View>
          <View style={styles.accessCard}>
            <Ionicons name="megaphone-outline" size={28} color="#3B82F6" />
            <Text style={styles.accessText}>Announcements</Text>
          </View>
          <View style={styles.accessCard}>
            <Ionicons name="calendar-outline" size={28} color="#3B82F6" />
            <Text style={styles.accessText}>Events</Text>
          </View>
          <View style={styles.accessCard}>
            <Ionicons name="chatbubbles-outline" size={28} color="#3B82F6" />
            <Text style={styles.accessText}>Forum</Text>
          </View>
        </View>

        {/* 🔹 News Preview Section */}
        <Text style={styles.sectionTitle}>Latest News</Text>
        <View style={styles.newsCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=800&q=60",
            }}
            style={styles.newsImage}
          />
          <View style={styles.newsContent}>
            <Text style={styles.newsTitle}>TMC Sports Fest 2025 Kicks Off</Text>
            <Text style={styles.newsDesc}>
              Excitement fills the air as TMC opens its annual inter-college sports fest!
            </Text>
            <Text style={styles.newsDate}>October 11, 2025</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { padding: 20, backgroundColor: "#1E293B", borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  subHeader: { color: "#CBD5E1", marginTop: 4 },
  banner: { margin: 20, borderRadius: 20, overflow: "hidden", elevation: 4 },
  bannerImage: { width: "100%", height: 180 },
  bannerTextContainer: { position: "absolute", bottom: 15, left: 15 },
  bannerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  bannerSubtitle: { color: "#E2E8F0", fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginHorizontal: 20, marginTop: 20, color: "#1E293B" },
  quickAccessContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", marginTop: 10 },
  accessCard: {
    backgroundColor: "#fff",
    width: "40%",
    padding: 20,
    marginVertical: 10,
    alignItems: "center",
    borderRadius: 15,
    elevation: 3,
  },
  accessText: { marginTop: 10, fontWeight: "600", color: "#1E293B" },
  newsCard: { backgroundColor: "#fff", borderRadius: 15, margin: 20, overflow: "hidden", elevation: 4 },
  newsImage: { width: "100%", height: 180 },
  newsContent: { padding: 15 },
  newsTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  newsDesc: { color: "#64748B", marginVertical: 5 },
  newsDate: { color: "#94A3B8", fontSize: 12 },
});
