import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function UserProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUser(null);
        setLoading(false);
        return;
      }

      const fetchUserDoc = async () => {
        setLoading(true);
        try {
          const userRef = doc(db, "users", u.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            setUser({
              uid: u.uid,
              displayName: u.displayName || data.displayName || data.name || 'User',
              email: u.email || data.email,
              username: data.username || data.handle || '@user',
              photoURL: data.photoURL || data.avatar || u.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
              followers: data.followers || 0,
              following: data.following || 0,
            });
          } else {
            // If user doc doesn't exist, fall back to auth info
            setUser({
              uid: u.uid,
              displayName: u.displayName || u.email || 'User',
              email: u.email,
              username: '@user',
              photoURL: u.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
              followers: 0,
              following: 0,
            });
          }
        } catch (err) {
          console.error('Error fetching user doc:', err);
          setUser({
            uid: u.uid,
            displayName: u.displayName || u.email || 'User',
            email: u.email,
            username: '@user',
            photoURL: u.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            followers: 0,
            following: 0,
          });
        } finally {
          setLoading(false);
        }
      };

      fetchUserDoc();
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
     
      {/* Profile Info */}
      <View style={styles.profileCard}>
        <Image source={{ uri: user?.photoURL }} style={styles.avatar} />
        <Text style={styles.name}>{user?.displayName}</Text>
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        

        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditUser', { uid: user?.uid })}>
          <Ionicons name="pencil-outline" size={18} color="#fff" />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Account Settings */}
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Account Settings</Text>

        <View style={styles.settingItem}>
          <Ionicons name="notifications-outline" size={22} color="#3B82F6" />
          <Text style={styles.settingText}>Notifications</Text>
        </View>
        <View style={styles.settingItem}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#3B82F6" />
          <Text style={styles.settingText}>Privacy & Security</Text>
        </View>
        <View style={styles.settingItem}>
          <Ionicons name="help-circle-outline" size={22} color="#3B82F6" />
          <Text style={styles.settingText}>Help & Support</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  headerTitle: { color: '#0F172A', fontSize: 22, fontWeight: 'bold' },
  profileCard: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 20,
    alignItems: "center",
    padding: 20,
    elevation: 4,
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  email: { color: "#64748B", marginBottom: 15 },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  editText: { color: "#fff", marginLeft: 5, fontWeight: "600" },
  settingsContainer: { marginHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1E293B", marginBottom: 10 },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
  },
  settingText: { marginLeft: 10, fontSize: 15, color: "#1E293B" },
});