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
  ImageBackground,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
        {/* Hero Section with Image and Gradient Overlay */}
        <View style={styles.heroContainer}>
          {news.image ? (
            <ImageBackground 
              source={{ uri: news.image }} 
              style={styles.heroImage}
              imageStyle={styles.heroImageStyle}
            >
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.7)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradientOverlay}
              >
                {/* Top Action Bar */}
                <View style={styles.heroTopBar}>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.heroButton}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={toggleBookmark} style={styles.heroButton} disabled={loading}>
                    <MaterialCommunityIcons
                      name={isBookmarked ? "bookmark" : "bookmark-outline"}
                      size={26}
                      color={isBookmarked ? "#FFC107" : "#fff"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Content Overlay */}
                <View style={styles.heroContent}>
                  {/* Category Badge */}
                  {news.category && (
                    <View style={styles.heroCategoryBadge}>
                      <Text style={styles.heroCategoryText}>{news.category}</Text>
                    </View>
                  )}

                  {/* Title */}
                  <Text style={styles.heroTitle}>{news.title}</Text>
                </View>
              </LinearGradient>
            </ImageBackground>
          ) : (
            <View style={[styles.heroImage, { backgroundColor: '#E6EEF8', justifyContent: 'center', alignItems: 'center' }]}>
              <MaterialCommunityIcons name="image-off-outline" size={48} color="#94A3B8" />
            </View>
          )}
        </View>

        {/* Content Container */}
        <View style={styles.content}>
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
  heroContainer: {
    width: "100%",
    height: 360,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
  },
  heroImageStyle: {
    resizeMode: "cover",
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  heroTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingHorizontal: 4,
  },
  heroButton: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
  },
  heroContent: {
    paddingBottom: 24,
  },
  heroCategoryBadge: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  heroCategoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 36,
  },
  content: {
    padding: 16,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  metaInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  date: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },
  body: {
    fontSize: 16,
    color: "#475569",
    lineHeight: 26,
    marginBottom: 24,
  },
  infoSection: {
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#0F172A",
    marginLeft: 12,
    fontWeight: "600",
  },
});