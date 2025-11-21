import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView, TouchableOpacity, Dimensions, FlatList, Alert, TextInput } from "react-native";
import FloatingNewsScreen from './FloatingNewsScreen';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../../firebase/firebaseConfig";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export default function UserHomeScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('All news');
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchInputRef = useRef(null);
  const [allNews, setAllNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [bookmarkedNews, setBookmarkedNews] = useState([]);
  const [showFloatingNews, setShowFloatingNews] = useState(false);
  const [selectedFloatingNews, setSelectedFloatingNews] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    {
      id: '1',
      title: 'A historic center of learning and community growth.',
      image: require('../../assets/tmc.jpg'),
    },
    {
      id: '2',
      title: 'City lights and mountain nights',
      image: require('../../assets/tmc.jpg'),
      time: '6 hours ago'
    }
  ];

  // Fetch categories from Firestore on mount
  useEffect(() => {
    const categoriesRef = collection(db, 'categories');
    const unsubscribe = onSnapshot(
      query(categoriesRef),
      (snapshot) => {
        const categoryNames = snapshot.docs.map((doc) => doc.data().name);
        setCategories(['All news', ...categoryNames]);
      },
      (error) => {
        console.error('Error fetching categories:', error);
      }
    );
    return unsubscribe;
  }, []);

  // Fetch user bookmarks
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setBookmarkedNews(snapshot.data().favorites || []);
        }
      },
      (error) => {
        console.error('Error fetching bookmarks:', error);
      }
    );
    return unsubscribe;
  }, []);

  // Fetch approved news from Firestore sorted by newest first
  useEffect(() => {
    const newsRef = collection(db, 'news');
    const q = query(newsRef, where('status', '==', 'Approved'));
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          // map documents to include event image when eventId exists
          const newsData = await Promise.all(snapshot.docs.map(async (d) => {
            const data = d.data();
            let imageUrl = data.imageUrl || data.image || null;

            // If this news references an event, try to fetch the event image and include event data
            let eventData = null;
            if (data.eventId) {
              try {
                const eventRef = doc(db, 'events', data.eventId);
                const eventSnap = await getDoc(eventRef);
                if (eventSnap.exists()) {
                  const ev = eventSnap.data();
                  // prefer event's image when news has none
                  imageUrl = imageUrl || ev.imageUrl || ev.image || null;
                  eventData = { id: eventSnap.id, ...ev };
                }
              } catch (e) {
                console.warn('Failed to load event image/data for', data.eventId, e.message);
              }
            }

            return {
              id: d.id,
              title: data.title,
              image: imageUrl,
              description: data.description,
              authorName: data.authorName,
              authorAvatar: data.authorAvatar,
              time: data.createdAt ? formatTimeAgo(new Date(data.createdAt.seconds * 1000)) : 'Recently',
              category: data.category || 'General',
              createdAt: data.createdAt,
              raw: data,
              // include referenced event details (if any) so the floating modal can show event info
              event: eventData,
              eventId: data.eventId || null,
            };
          }));

          // Sort by createdAt descending (newest first) in JavaScript
          newsData.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });

          setAllNews(newsData);
          setLatestNews(newsData.slice(0, 6)); // Get 6 latest for carousel
          setFilteredNews(newsData);
          setRefreshing(false);
        } catch (error) {
          console.error('Error processing news snapshot:', error);
          setRefreshing(false);
        }
      },
      (error) => {
        console.error('Error fetching news:', error);
        setRefreshing(false);
      }
    );
    return unsubscribe;
  }, [refreshKey]);

  // Format time ago (e.g., "2 hours ago", "15 minutes ago")
  const formatTimeAgo = (date) => {
    const now = new Date();
    const secondsAgo = Math.floor((now - date) / 1000);

    if (secondsAgo < 60) return 'just now';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} minutes ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hours ago`;
    if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Filter news based on category and debounced search query
  useEffect(() => {
    let filtered = allNews;

    // Filter by category
    if (activeCategory !== 'All news') {
      filtered = filtered.filter((item) => item.category === activeCategory);
    }

    // Filter by debounced search query across multiple fields
    if (debouncedSearch !== '') {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter((item) => {
        const title = (item.title || '').toString().toLowerCase();
        const desc = (item.description || '').toString().toLowerCase();
        const author = (item.authorName || '').toString().toLowerCase();
        const category = (item.category || '').toString().toLowerCase();
        return title.includes(q) || desc.includes(q) || author.includes(q) || category.includes(q);
      });
    }

    setFilteredNews(filtered);
  }, [activeCategory, debouncedSearch, allNews]);

  // Handle bookmark toggle
  const toggleBookmark = async (newsId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDocRef = doc(db, 'users', currentUser.uid);
      const isBookmarked = bookmarkedNews.includes(newsId);

      if (isBookmarked) {
        // Remove bookmark
        await updateDoc(userDocRef, {
          favorites: arrayRemove(newsId)
        });
      } else {
        // Add bookmark
        await updateDoc(userDocRef, {
          favorites: arrayUnion(newsId)
        });
        // Navigate to Favorites tab
        navigation.navigate('FavoritesTab');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('Error', 'Failed to update bookmark');
    }
  };

  // Use a single FlatList as the main scroll container to avoid nested VirtualizedLists
  return (
    <>
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredNews}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); setRefreshKey(k => k + 1); }}
        ListHeaderComponent={() => (
          <>
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search news..."
                  ref={searchInputRef}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInput}
                  editable={true}
                />
                {searchQuery !== '' && (
                  <TouchableOpacity onPress={() => { setSearchQuery(''); searchInputRef.current?.clear(); }} style={{ marginLeft: 8 }}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Category Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow} contentContainerStyle={{ paddingHorizontal: 16 }} keyboardShouldPersistTaps="always" keyboardDismissMode="none">
              {categories.map((cat) => (
                <TouchableOpacity key={cat} onPress={() => setActiveCategory(cat)} style={[styles.catItem, activeCategory === cat && styles.catItemActive]}>
                  <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Featured carousel */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              ref={carouselRef}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="none"
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / Dimensions.get('window').width);
                setActiveSlide(index);
              }}
            >
              {slides.map((s) => (
                <View key={s.id} style={styles.featureCard}>
                  <Image source={s.image} style={styles.featureImage} />
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.featureGradient}
                  />
                  <View style={styles.featureTextWrap}>
                    <Text style={styles.featureTitle} numberOfLines={2}>{s.title}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.dotsRow}>
              {slides.map((_, i) => (
                <View key={i} style={[styles.dot, activeSlide === i && styles.dotActive]} />
              ))}
            </View>

            {/* Latest news header */}
            <View style={styles.latestHeaderRow}>
              <Text style={styles.sectionTitle}>Latest news</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Latest News Horizontal Carousel */}
            <FlatList
              data={latestNews}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.latestNewsContainer}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="none"
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.latestNewsCard}
                  onPress={() => { setSelectedFloatingNews(item); setShowFloatingNews(true); }}
                >
                  {/* News Image */}
                  {item.image && (
                    <Image source={{ uri: item.image }} style={styles.latestNewsImage} />
                  )}

                  {/* Content Overlay */}
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.latestNewsGradient}
                  >
                    <View style={styles.latestNewsContent}>
                      <Text style={styles.latestNewsTitle} numberOfLines={2}>{item.title}</Text>
                      <Text style={styles.latestNewsTime}>{item.time}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            />

            {/* "Latest news" Section Divider - for non-carousel list below */}
            <View style={styles.dividerSection} />

            {/* Recommended For you header */}
            <View style={styles.recommendedHeaderRow}>
              <Text style={styles.recommendedTitle}>Recommended For you</Text>
            </View>
          </>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.newsCardWrapper}
            onPress={() => { setSelectedFloatingNews(item); setShowFloatingNews(true); }}
          >
            {/* News Image with Gradient Overlay */}
            <View style={styles.newsImageContainer}>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.newsImage} />
              )}
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.newsImageGradient}
              />
              
              {/* Bookmark Icon - Top Right */}
              <TouchableOpacity 
                style={styles.newsBookmarkButton}
                onPress={() => toggleBookmark(item.id)}
              >
                <MaterialCommunityIcons 
                  name={bookmarkedNews.includes(item.id) ? "bookmark" : "bookmark-outline"} 
                  size={20} 
                  color={bookmarkedNews.includes(item.id) ? "#FF7A00" : "#fff"} 
                />
              </TouchableOpacity>

              {/* Title Overlay */}
              <Text style={styles.newsCardTitle} numberOfLines={3}>{item.title}</Text>
            </View>

            {/* Card Bottom Section - Author & Category */}
            <View style={styles.newsCardBottom}>
              <View style={styles.newsBottomLeft}>
                <Image
                  source={{ uri: item.authorAvatar || 'https://i.pravatar.cc/100' }}
                  style={styles.newsAuthorAvatar}
                />
                <View style={styles.newsAuthorInfo}>
                  <Text style={styles.newsAuthorName} numberOfLines={1}>{item.authorName}</Text>
                  <Text style={styles.newsCardTime}>{item.time}</Text>
                </View>
              </View>
              <View style={styles.categoryBadgeSmall}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No news found</Text>
          </View>
        )}
      />
    </SafeAreaView>
      {/* Floating news modal opened from Home */}
      <FloatingNewsScreen visible={showFloatingNews} onClose={() => { setShowFloatingNews(false); setSelectedFloatingNews(null); }} navigation={navigation} newsItem={selectedFloatingNews} />
    </>
  );
}

const { width: WINDOW_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topRow: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 12 },
  logoBadge: { backgroundColor: '#FF7A00', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  logoText: { color: '#fff', fontWeight: '700' },
  searchBarContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#E6EEF8', height: 44 },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A', marginLeft: 4, padding: 0 },
  categoriesRow: { marginTop: 4, marginBottom: 12 },
  catItem: { backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 8, marginRight: 10, borderRadius: 20, borderWidth: 1, borderColor: '#E6EEF8' },
  catItemActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  catText: { color: '#334155' },
  catTextActive: { color: '#fff', fontWeight: '700' },
  featureCard: { width: WINDOW_WIDTH, alignItems: 'center', paddingVertical: 12 },
  featureImage: { width: WINDOW_WIDTH - 32, height: 200, borderRadius: 14 },
  featureGradient: { position: 'absolute', left: 16, right: 16, top: 12, height: 200, borderRadius: 14 },
  featureOverlay: { position: 'absolute', left: 16, right: 16, top: 12, height: 200, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.18)' },
  featureTextWrap: { position: 'absolute', left: 28, bottom: 28, right: 28 },
  featureTime: { color: '#F1F5F9', fontSize: 12, marginBottom: 6 },
  featureTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0', marginHorizontal: 4 },
  dotActive: { backgroundColor: '#7C3AED', width: 18, borderRadius: 9 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  latestHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 18, marginBottom: 12 },
  viewAll: { color: '#64748B', fontSize: 13 },
  
  // Latest News Carousel Styles
  latestNewsContainer: { paddingHorizontal: 12, paddingVertical: 8 },
  latestNewsCard: { 
    width: 280,
    height: 160,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a'
  },
  latestNewsImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  latestNewsGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  bookmarkIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 6,
    borderRadius: 8,
    zIndex: 10,
  },
  latestNewsContent: {
    justifyContent: 'flex-end',
  },
  latestNewsTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 6,
  },
  latestNewsTime: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '500',
  },

  dividerSection: {
    height: 12,
    backgroundColor: '#E6EEF8',
    marginVertical: 12,
  },

  // Recommended For you Section
  recommendedHeaderRow: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },

  // News Card Styles (matching image design)
  newsCardWrapper: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  newsImageContainer: {
    position: 'relative',
    height: 240,
    backgroundColor: '#E6EEF8',
  },
  newsImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  newsImageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  newsBookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 10,
    borderRadius: 50,
    zIndex: 10,
  },
  newsCardTitle: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  newsCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  newsBottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  newsAuthorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  newsAuthorInfo: {
    flex: 1,
  },
  newsAuthorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  newsCardTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  categoryBadgeSmall: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#7C3AED',
    fontSize: 10,
    fontWeight: '700',
  },

  // Old styles (keeping for reference)
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  authorLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  authorName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  newsImageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  newsTagsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTagText: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '600',
  },
  trendingTag: {
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trendingTagText: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '600',
  },
  newsActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionButton: {
    padding: 8,
  },

  // List Item Styles (old - keeping for reference)
  listItem: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 8, borderRadius: 12, alignItems: 'center', elevation: 2 },
  listThumb: { width: 72, height: 72, borderRadius: 8 },
  listContent: { marginLeft: 12, flex: 1 },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  listTime: { color: '#94A3B8', fontSize: 12, marginTop: 6 },
  listBookmark: { padding: 8 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#94A3B8' }
});