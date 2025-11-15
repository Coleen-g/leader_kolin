import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs, limit, onSnapshot, orderBy } from "firebase/firestore";

export default function EditorDashboardScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState([
    { id: "1", label: "Pending", count: 0, icon: "time-outline", color: "#F59E0B" },
    { id: "2", label: "Published", count: 0, icon: "newspaper-outline", color: "#10B981" },
    { id: "3", label: "Rejected", count: 0, icon: "close-circle-outline", color: "#EF4444" },
  ]);
  const [recent, setRecent] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const quickActions = [
    { id: "1", label: "Create News", icon: "create-outline", color: "#2563EB", route: "CreateTab" },
    { id: "2", label: "Manage Articles", icon: "document-text-outline", color: "#7C3AED", route: "ManageTab" },
    { id: "3", label: "View Profile", icon: "person-outline", color: "#0EA5A4", route: "ProfileTab" },
    { id: "4", label: "Settings", icon: "settings-outline", color: "#F97316", route: "SettingsTab" },
  ];

  // Listen for article status changes (real-time) - keeps stats updated
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const newsRef = collection(db, "news");
    const userArticlesQuery = query(
      newsRef,
      where("authorUID", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(userArticlesQuery, (snapshot) => {
      // Update stats in real-time
      let pending = 0, approved = 0, declined = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "Pending") pending++;
        else if (data.status === "Approved") approved++;
        else if (data.status === "Declined") declined++;
      });

      setStats([
        { id: "1", label: "Pending", count: pending, icon: "time-outline", color: "#F59E0B" },
        { id: "2", label: "Published", count: approved, icon: "newspaper-outline", color: "#10B981" },
        { id: "3", label: "Rejected", count: declined, icon: "close-circle-outline", color: "#EF4444" },
      ]);
    });

    return unsubscribe;
  }, []);

  // Fetch stats from Firestore
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const newsRef = collection(db, "news");
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setLoadingStats(false);
          return;
        }

        const pendingSnap = await getDocs(query(newsRef, where("authorUID", "==", currentUser.uid), where("status", "==", "Pending")));
        const approvedSnap = await getDocs(query(newsRef, where("authorUID", "==", currentUser.uid), where("status", "==", "Approved")));
        const declinedSnap = await getDocs(query(newsRef, where("authorUID", "==", currentUser.uid), where("status", "==", "Declined")));

        setStats([
          { id: "1", label: "Pending", count: pendingSnap.size, icon: "time-outline", color: "#F59E0B" },
          { id: "2", label: "Published", count: approvedSnap.size, icon: "newspaper-outline", color: "#10B981" },
          { id: "3", label: "Rejected", count: declinedSnap.size, icon: "close-circle-outline", color: "#EF4444" },
        ]);

        setLoadingStats(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch recent submissions
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setLoadingRecent(false);
          return;
        }

        const newsRef = collection(db, "news");
        const recentQuery = query(
          newsRef,
          where("authorUID", "==", currentUser.uid),
          limit(10)
        );
        const recentSnap = await getDocs(recentQuery);

        const recentData = recentSnap.docs.map((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate?.() || new Date();
          const now = new Date();
          const diffMs = now - createdAt;
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);

          let timeAgo = "just now";
          if (diffMins > 0 && diffMins < 60) timeAgo = `${diffMins}m`;
          else if (diffHours > 0 && diffHours < 24) timeAgo = `${diffHours}h`;
          else if (diffDays > 0) timeAgo = `${diffDays}d`;

          return {
            id: doc.id,
            title: data.title || "Untitled",
            author: data.author || "Unknown",
            time: timeAgo,
            status: data.status || "Pending",
            createdAt: createdAt,
          };
        });

        // Sort by date on client side instead of in query
        recentData.sort((a, b) => b.createdAt - a.createdAt);
        setRecent(recentData.slice(0, 5));
        setLoadingRecent(false);
      } catch (error) {
        console.error("Error fetching recent submissions:", error);
        setLoadingRecent(false);
      }
    };

    fetchRecent();
  }, []);

  const handleQuickAction = (route) => {
    if (route) navigation.navigate(route);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          placeholder="Search articles, titles or authors"
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.statsArea}>
        {loadingStats ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667EEA" />
          </View>
        ) : (
          <FlatList
            data={stats}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={[styles.statCard, { borderLeftColor: item.color }]}>
                <View style={[styles.statIconWrap, { backgroundColor: item.color + "22" }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={styles.statCount}>{item.count}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            )}
          />
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((a) => (
            <TouchableOpacity key={a.id} style={styles.actionCard} onPress={() => handleQuickAction(a.route)}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + "15" }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent Submissions</Text>
        {loadingRecent ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667EEA" />
          </View>
        ) : recent.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="mail-outline" size={48} color="#E2E8F0" />
            <Text style={styles.emptyText}>No submissions yet</Text>
          </View>
        ) : (
          recent.map((r) => (
            <View key={r.id} style={styles.recentCard}>
              <View style={styles.recentLeft}>
                <View style={styles.recentAvatar} />
              </View>
              <View style={styles.recentBody}>
                <Text style={styles.recentTitle} numberOfLines={2}>{r.title}</Text>
                <View style={styles.recentMetaRow}>
                  <Text style={styles.recentAuthor}>{r.author}</Text>
                  <Text style={styles.recentDot}>•</Text>
                  <Text style={styles.recentTime}>{r.time}</Text>
                </View>
              </View>
              <View style={styles.recentRight}>
                <View style={[styles.statusBadge, r.status === "Approved" ? styles.published : r.status === "Declined" ? styles.rejected : styles.pending]}>
                  <Text style={styles.statusText}>{r.status}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#EEF2FF",
  },
  searchInput: { marginLeft: 8, fontSize: 14, color: "#0F172A", flex: 1 },
  statsArea: { marginTop: 12, paddingLeft: 16 },
  statCard: { width: 150, backgroundColor: "#fff", borderRadius: 12, padding: 12, marginRight: 12, elevation: 1, borderLeftWidth: 4 },
  statIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  statCount: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  statLabel: { fontSize: 12, color: "#64748B", marginTop: 4 },
  content: { paddingHorizontal: 16, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 8 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  actionCard: { width: "48%", backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: "row", alignItems: "center", elevation: 1 },
  actionIcon: { width: 44, height: 44, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  actionLabel: { fontSize: 15, color: "#0F172A", fontWeight: "700" },
  recentCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 12, elevation: 1 },
  recentLeft: { width: 44, alignItems: "center" },
  recentAvatar: { width: 44, height: 44, borderRadius: 8, backgroundColor: "#E6EEF8" },
  recentBody: { flex: 1, paddingHorizontal: 12 },
  recentTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  recentMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  recentAuthor: { fontSize: 12, color: "#64748B" },
  recentDot: { marginHorizontal: 6, color: "#94A3B8" },
  recentTime: { fontSize: 12, color: "#94A3B8" },
  recentRight: { alignItems: "flex-end" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginBottom: 8 },
  statusText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  published: { backgroundColor: "#10B981" },
  rejected: { backgroundColor: "#EF4444" },
  pending: { backgroundColor: "#F59E0B" },
  loadingContainer: { height: 120, justifyContent: "center", alignItems: "center" },
  emptyContainer: { height: 200, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 12, fontSize: 14, color: "#94A3B8", fontWeight: "600" },
});
