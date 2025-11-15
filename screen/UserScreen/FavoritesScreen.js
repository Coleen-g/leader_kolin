import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayRemove, onSnapshot } from "firebase/firestore";

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's bookmarked news with real-time listener
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Listen to user document for bookmarks changes
    const userRef = doc(db, "users", currentUser.uid);
    const unsubUser = onSnapshot(userRef, async (userSnap) => {
      if (userSnap.exists()) {
        const bookmarkedIds = userSnap.data().favorites || [];
        
        // Fetch actual news documents for those IDs
        if (bookmarkedIds.length > 0) {
          const newsRef = collection(db, "news");
          const unsubNews = onSnapshot(newsRef, (newsSnap) => {
            const favoriteNews = newsSnap.docs
              .filter(doc => bookmarkedIds.includes(doc.id))
              .map(doc => ({
                id: doc.id,
                title: doc.data().title,
                image: doc.data().imageUrl || doc.data().image || null,
                date: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000).toLocaleDateString() : "",
                description: doc.data().content || doc.data().description || "",
                category: doc.data().category || "General",
                authorName: doc.data().author || doc.data().authorName || 'Unknown',
                authorAvatar: doc.data().authorAvatar || doc.data().authorPhotoURL || null,
                raw: doc.data(),
              }));
            
            setFavorites(favoriteNews);
            setLoading(false);
          });
          return unsubNews;
        } else {
          setFavorites([]);
          setLoading(false);
        }
      }
    }, (error) => {
      console.error("Error fetching favorites:", error);
      setLoading(false);
    });

    return unsubUser;
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.favoriteCard}
      onPress={() => navigation.navigate("HomeTab", { screen: "NewsDetail", params: { news: item } })}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, { backgroundColor: '#E6EEF8', justifyContent: 'center', alignItems: 'center' }]}>
          <MaterialCommunityIcons name="image-off-outline" size={28} color="#94A3B8" />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.author}>{item.authorName}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeFavorite(item.id)}
      >
        <Ionicons name="bookmark" size={20} color="#7C3AED" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const removeFavorite = async (newsId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        favorites: arrayRemove(newsId)
      });
      
      setFavorites(favorites.filter(fav => fav.id !== newsId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <Text style={styles.headerSubtitle}>Saved news articles</Text>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={48} color="#E2E8F0" />
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>Bookmark articles to see them here</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  headerWrap: { paddingHorizontal: 16, paddingVertical: 16 },
  headerTitle: { fontSize: 26, fontWeight: "700", color: "#0F172A", marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: "#94A3B8" },
  listContent: { paddingHorizontal: 16, paddingBottom: 30 },
  favoriteCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
    padding: 12,
    elevation: 2,
    alignItems: "flex-start",
  },
  thumbnail: { width: 84, height: 84, borderRadius: 8 },
  content: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  author: { fontSize: 12, color: "#64748B" },
  dot: { marginHorizontal: 6, color: "#94A3B8" },
  date: { fontSize: 12, color: "#94A3B8" },
  categoryBadge: { marginTop: 8, backgroundColor: "#EEF2FF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: "flex-start" },
  categoryText: { color: "#7C3AED", fontSize: 12, fontWeight: "700" },
  removeButton: { padding: 8 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 60 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#0F172A", marginTop: 12 },
  emptySubtext: { fontSize: 13, color: "#94A3B8", marginTop: 6 },
});
