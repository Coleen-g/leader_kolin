import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView, TouchableOpacity, Dimensions, FlatList, Alert, TextInput } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function UserHomeScreen() {
  const [activeCategory, setActiveCategory] = useState('All news');
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allNews, setAllNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);

  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    {
      id: '1',
      title: 'A historic center of learning and community growth.',
      image: require('../../assets/tmc.jpg'), // Change to your actual image name
     
    },
    {
      id: '2',
      title: 'City lights and mountain nights',
      image: require('../../assets/tmc.jpg'), // Change to your actual image name
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

  // Fetch approved news from Firestore
  useEffect(() => {
    const newsRef = collection(db, 'news');
    const q = query(newsRef, where('status', '==', 'Approved'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          image: doc.data().imageUrl,
          time: doc.data().createdAt
            ? new Date(doc.data().createdAt.seconds * 1000).toLocaleDateString()
            : 'Recently',
          category: doc.data().category || 'General',
        }));
        setAllNews(newsData);
        setFilteredNews(newsData);
      },
      (error) => {
        console.error('Error fetching news:', error);
      }
    );
    return unsubscribe;
  }, []);

  // Filter news based on category and search query
  useEffect(() => {
    let filtered = allNews;

    // Filter by category
    if (activeCategory !== 'All news') {
      filtered = filtered.filter((item) => item.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNews(filtered);
  }, [activeCategory, searchQuery, allNews]);

  // Use a single FlatList as the main scroll container to avoid nested VirtualizedLists
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredNews}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search news..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInput}
                  editable={true}
                />
              </View>
            </View>

            {/* Category Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
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
              <Text style={styles.viewAll}>See all</Text>
            </View>
          </>
        )}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            {item.image && <Image source={{ uri: item.image }} style={styles.listThumb} />}
            <View style={styles.listContent}>
              <Text style={styles.listTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.listTime}>{item.time}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No news found</Text>
          </View>
        )}
      />
    </SafeAreaView>
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
  latestHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 18, marginBottom: 12 },
  viewAll: { color: '#64748B', fontSize: 13 },
  listItem: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 8, borderRadius: 12, alignItems: 'center', elevation: 2 },
  listThumb: { width: 72, height: 72, borderRadius: 8 },
  listContent: { marginLeft: 12, flex: 1 },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  listTime: { color: '#94A3B8', fontSize: 12, marginTop: 6 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#94A3B8' }
});