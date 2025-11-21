import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { db, auth } from "../../firebase/firebaseConfig";
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function UserNewsScreen({ navigation }) {
  const [allNews, setAllNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [userUid, setUserUid] = useState(null);
  const [authorAvatar, setAuthorAvatar] = useState('https://i.pravatar.cc/100');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All news');
  const [bookmarkedNews, setBookmarkedNews] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  // listen for auth changes to get current user uid and avatar
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUserUid(u.uid);
        setAuthorAvatar(u.photoURL || 'https://i.pravatar.cc/100');
        // Fetch user's bookmarked news
        fetchBookmarkedNews(u.uid);
      } else {
        setUserUid(null);
        setAuthorAvatar('https://i.pravatar.cc/100');
        setAllNews([]);
        setFilteredNews([]);
        setBookmarkedNews([]);
      }
    });
    return unsub;
  }, []);

  // Fetch bookmarked news IDs from user document
  const fetchBookmarkedNews = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const unsub = onSnapshot(userDocRef, (snap) => {
        if (snap.exists()) {
          const bookmarks = snap.data().favorites || [];
          setBookmarkedNews(bookmarks);
        } else {
          setBookmarkedNews([]);
        }
      });
      return unsub;
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  // Toggle bookmark for a news item
  const toggleBookmark = async (newsItem) => {
    try {
      if (!userUid) return;
      const userDocRef = doc(db, 'users', userUid);
      
      // Check if user document exists
      const userSnap = await getDoc(userDocRef);
      
      if (!userSnap.exists()) {
        // Create user document if it doesn't exist
        await setDoc(userDocRef, {
          favorites: [newsItem.id]
        }, { merge: true });
        setBookmarkedNews([newsItem.id]);
      } else {
        // Document exists, update it
        if (bookmarkedNews.includes(newsItem.id)) {
          // Remove from bookmarks
          await updateDoc(userDocRef, {
            favorites: arrayRemove(newsItem.id)
          });
          setBookmarkedNews(bookmarkedNews.filter(id => id !== newsItem.id));
        } else {
          // Add to bookmarks
          await updateDoc(userDocRef, {
            favorites: arrayUnion(newsItem.id)
          });
          setBookmarkedNews([...bookmarkedNews, newsItem.id]);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Fetch only Approved news (client-side sort to avoid composite index requirement)
  useEffect(() => {
    const newsRef = collection(db, "news");
    // Fetch only Approved news documents
    const q = query(newsRef, where('status', '==', 'Approved'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const news = await Promise.all(snapshot.docs.map(async (d) => {
          const data = d.data();
          let image = data.imageUrl || data.image || null;

          if (!image && data.eventId) {
            try {
              const eventRef = doc(db, 'events', data.eventId);
              const eventSnap = await getDoc(eventRef);
              if (eventSnap.exists()) {
                const ev = eventSnap.data();
                image = ev.imageUrl || ev.image || image;
              }
            } catch (e) {
              console.warn('Failed to load event image for', data.eventId, e.message);
            }
          }

          return {
            id: d.id,
            title: data.title,
            image,
            date: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : "",
            description: data.content || data.description || "",
            category: data.category || "General",
            authorName: data.author || data.authorName || 'Unknown',
            authorAvatar: data.authorAvatar || data.authorPhotoURL || null,
            raw: data,
          };
        }));

        // Sort by createdAt descending in JavaScript to avoid composite index
        news.sort((a, b) => {
          const ta = a.raw && a.raw.createdAt && a.raw.createdAt.seconds ? a.raw.createdAt.seconds : 0;
          const tb = b.raw && b.raw.createdAt && b.raw.createdAt.seconds ? b.raw.createdAt.seconds : 0;
          return tb - ta;
        });

        setAllNews(news);
        setFilteredNews(news);
        setRefreshing(false);
      } catch (error) {
        console.error("Error processing news snapshot:", error);
        setRefreshing(false);
      }
    }, (error) => {
      console.error("Error fetching news:", error);
      setRefreshing(false);
    });

    return unsubscribe;
  }, [refreshKey]);

  // fetch categories (optional) so chips don't error when rendered
  useEffect(() => {
    const categoriesRef = collection(db, 'categories');
    const unsub = onSnapshot(categoriesRef, (snap) => {
      const cats = snap.docs.map((d) => d.data().name);
      setCategories(['All news', ...cats]);
    }, (err) => {
      console.error('Error fetching categories:', err);
      setCategories(['All news']);
    });
    return unsub;
  }, []);

  // apply client-side filtering (category + search)
  useEffect(() => {
    let filtered = allNews;
    if (activeCategory && activeCategory !== 'All news') {
      filtered = filtered.filter((n) => n.category === activeCategory);
    }
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((n) => (n.title && n.title.toLowerCase().includes(q)) || (n.description && n.description.toLowerCase().includes(q)));
    }
    setFilteredNews(filtered);
  }, [allNews, activeCategory, searchQuery]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listCard}
      activeOpacity={0.9}
      onPress={() => {
        // If this news item is actually an event link, navigate to EventDetail
        if (item.raw && item.raw.eventId) {
          navigation.navigate('EventDetail', { eventId: item.raw.eventId });
        } else {
          navigation.navigate('NewsDetail', { news: item });
        }
      }}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.listThumb} />
      ) : (
        <View style={[styles.listThumb, { backgroundColor: '#E6EEF8', justifyContent: 'center', alignItems: 'center' }]}>
          <MaterialCommunityIcons name="image-off-outline" size={28} color="#94A3B8" />
        </View>
      )}
      <View style={styles.listContent}>
        <View style={styles.rowTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Image source={{ uri: item.authorAvatar || 'https://i.pravatar.cc/100' }} style={styles.metaAvatar} />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={styles.metaAuthor} numberOfLines={1} ellipsizeMode="tail">{item.authorName}</Text>
              <Text style={styles.listTime}>{item.date}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => toggleBookmark(item)}>
            <MaterialCommunityIcons 
              name={bookmarkedNews.includes(item.id) ? "bookmark" : "bookmark-outline"} 
              size={22} 
              color={bookmarkedNews.includes(item.id) ? "#7C3AED" : "#64748B"} 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.listTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.footerRow}>
          {item.category ? <View style={styles.categoryBadge}><Text style={styles.categoryText}>{item.category}</Text></View> : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredNews}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); setRefreshKey(k => k + 1); }}
        ListHeaderComponent={() => (
          <>
            <View style={styles.headerWrap}>
              <Text style={styles.headerTitle}>Discover</Text>
              <Text style={styles.headerSubtitle}>News from around the world</Text>
            </View>

            <View style={styles.searchBarContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput placeholder="Search news..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor="#94A3B8" style={styles.searchInput} />
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {categories.map((cat) => (
                <TouchableOpacity key={cat} onPress={() => setActiveCategory(cat)} style={[styles.catItem, activeCategory === cat && styles.catItemActive]}>
                  <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            

            <View style={styles.latestHeaderRow}>
              <Text style={styles.sectionTitle}>Latest news</Text>
              <Text style={styles.viewAll}>See all</Text>
            </View>
          </>
        )}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No news found</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </SafeAreaView>
  );
}

const { width: WINDOW_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerWrap: { paddingHorizontal: 16, paddingTop: 12 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#1D4ED8', marginBottom: 12 },
  headerSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: -8, marginBottom: 12 },
  searchBarContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#E6EEF8', height: 44 },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A', marginLeft: 4, padding: 0 },
  categoriesRow: { marginTop: 4, marginBottom: 12 },
  catItem: { backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 8, marginRight: 10, borderRadius: 20, borderWidth: 1, borderColor: '#E6EEF8' },
  catItemActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  catText: { color: '#334155' },
  catTextActive: { color: '#fff', fontWeight: '700' },
  featureCard: { width: WINDOW_WIDTH, alignItems: 'center', paddingVertical: 12 },
  featureImage: { width: WINDOW_WIDTH - 32, height: 180, borderRadius: 14 },
  featureOverlay: { position: 'absolute', left: 16, right: 16, top: 12, height: 180, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.18)' },
  featureTextWrap: { position: 'absolute', left: 28, bottom: 20, right: 28 },
  featureTime: { color: '#F1F5F9', fontSize: 12, marginBottom: 6 },
  featureTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0', marginHorizontal: 4 },
  dotActive: { backgroundColor: '#7C3AED', width: 18, borderRadius: 9 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  latestHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 18, marginBottom: 12 },
  viewAll: { color: '#64748B', fontSize: 13 },
  listCard: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 8, borderRadius: 12, alignItems: 'flex-start', elevation: 2 },
  listThumb: { width: 84, height: 84, borderRadius: 8 },
  listContent: { marginLeft: 12, flex: 1 },
  listTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  listTime: { color: '#94A3B8', fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start' },
  metaAvatar: { width: 28, height: 28, borderRadius: 14 },
  metaAuthor: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  footerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  categoryBadge: { marginTop: 8, backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  categoryText: { color: '#7C3AED', fontSize: 12, fontWeight: '700' },
  excerpt: { marginTop: 8, color: '#475569', fontSize: 13, lineHeight: 18 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#94A3B8' },
});