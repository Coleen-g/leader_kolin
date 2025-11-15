import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from "firebase/firestore";

export default function NewsDetailScreen({ route, navigation }) {
  const { news } = route.params;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if news is bookmarked
  useEffect(() => {
    checkIfBookmarked();
  }, []);

  const checkIfBookmarked = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const bookmarks = userSnap.data().favorites || [];
        setIsBookmarked(bookmarks.includes(news.id));
      }
    } catch (error) {
      console.error("Error checking bookmark:", error);
    }
  };

  const toggleBookmark = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      setLoading(true);
      const userDocRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        // Create user document if it doesn't exist
        await setDoc(userDocRef, {
          favorites: [news.id]
        }, { merge: true });
        setIsBookmarked(true);
      } else {
        // Document exists, update it
        if (isBookmarked) {
          // Remove from bookmarks
          await updateDoc(userDocRef, {
            favorites: arrayRemove(news.id)
          });
          setIsBookmarked(false);
        } else {
          // Add to bookmarks
          await updateDoc(userDocRef, {
            favorites: arrayUnion(news.id)
          });
          setIsBookmarked(true);
        }
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back and bookmark buttons */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.actionButton}>
            <Ionicons name="chevron-back" size={28} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleBookmark} style={styles.actionButton} disabled={loading}>
            <MaterialCommunityIcons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={26}
              color={isBookmarked ? "#7C3AED" : "#64748B"}
            />
          </TouchableOpacity>
        </View>

        {/* Featured Image */}
        {news.image ? (
          <Image source={{ uri: news.image }} style={styles.headerImage} />
        ) : (
          <View style={[styles.headerImage, { backgroundColor: '#E6EEF8', justifyContent: 'center', alignItems: 'center' }]}>
            <MaterialCommunityIcons name="image-off-outline" size={48} color="#94A3B8" />
          </View>
        )}

        {/* Content Container */}
        <View style={styles.content}>
          {/* Category Badge */}
          {news.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{news.category}</Text>
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>{news.title}</Text>

          {/* Meta Information */}
          <View style={styles.metaContainer}>
            <Image
              source={{ uri: news.authorAvatar || 'https://i.pravatar.cc/100' }}
              style={styles.authorAvatar}
            />
            <View style={styles.metaInfo}>
              <Text style={styles.authorName}>{news.authorName}</Text>
              <Text style={styles.date}>{news.date}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Content/Description */}
          <Text style={styles.body}>{news.description}</Text>

          {/* Additional Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color="#7C3AED" />
              <Text style={styles.infoText}>Published on {news.date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color="#7C3AED" />
              <Text style={styles.infoText}>By {news.authorName}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  actionButton: { padding: 8 },
  headerImage: {
    width: "100%",
    height: 280,
    backgroundColor: "#E6EEF8",
    marginTop: 50,
  },
  content: {
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  categoryText: { color: "#7C3AED", fontSize: 12, fontWeight: "700" },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
    lineHeight: 32,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  authorAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  metaInfo: { flex: 1 },
  authorName: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  date: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 16 },
  body: {
    fontSize: 16,
    color: "#475569",
    lineHeight: 26,
    marginBottom: 24,
  },
  infoSection: { backgroundColor: "#EEF2FF", borderRadius: 12, padding: 16 },
  infoRow: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  infoText: { fontSize: 14, color: "#0F172A", marginLeft: 12, fontWeight: "600" },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 50,
  },
});