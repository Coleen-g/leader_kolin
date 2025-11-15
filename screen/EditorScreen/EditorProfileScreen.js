import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Platform, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { auth, db } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

export default function ProfileScreen() {
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
            console.log('✅ User doc found:', data);
            setUser({
              uid: u.uid,
              displayName: data.name || data.displayName || u.displayName || 'User',
              email: u.email || data.email,
              username: data.username || '@user',
              role: data.role || 'Editor',
              photoURL: data.photoURL || u.photoURL || 'https://i.pravatar.cc/300',
              mobile: data.mobile || '',
              twitter: data.twitter || '',
              behance: data.behance || '',
              facebook: data.facebook || '',
            });
          } else {
            console.log('❌ No Firestore doc, creating one from auth data');
            const newUserData = {
              uid: u.uid,
              username: u.displayName || u.email?.split('@')[0] || 'editor',
              displayName: u.displayName || u.email || 'User',
              name: u.displayName || u.email || 'User',
              email: u.email,
              role: "Editor",
              createdAt: Timestamp.now(),
            };

            try {
              await setDoc(userRef, newUserData);
              console.log('✅ User doc created successfully');
            } catch (createErr) {
              console.error('Error creating user doc:', createErr);
            }

            setUser({
              uid: u.uid,
              displayName: u.displayName || u.email || 'User',
              email: u.email,
              username: u.displayName || u.email?.split('@')[0] || '@user',
              role: 'Editor',
              photoURL: u.photoURL || 'https://i.pravatar.cc/300',
              mobile: '',
              twitter: '',
              behance: '',
              facebook: '',
            });
          }
        } catch (err) {
          console.error('Error fetching user doc:', err);
          setUser({
            uid: u.uid,
            displayName: u.displayName || u.email || 'User',
            email: u.email,
            username: u.displayName || u.email?.split('@')[0] || '@user',
            role: 'Editor',
            photoURL: u.photoURL || 'https://i.pravatar.cc/300',
            mobile: '',
            twitter: '',
            behance: '',
            facebook: '',
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
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#667EEA" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#667EEA", "#7C3AED", "#6D28D9"]} style={styles.header}>
        
        <Ionicons name="settings-sharp" size={26} color="#fff" style={styles.settingsIcon} />

        {/* Profile Picture */}
        <Image
          source={{ uri: user?.photoURL }}
          style={styles.profileImage}
        />

        {/* Name and Role */}
        <Text style={styles.name}>{user?.displayName}</Text>
        <Text style={styles.role}>{user?.role}</Text>

      </LinearGradient>

      {/* Contact Information */}
      <View style={styles.card}>
        {/* Mobile */}
        <View style={styles.itemRow}>
          <MaterialIcons name="smartphone" size={22} color="#555" />
          <View style={styles.textBox}>
            <Text style={styles.label}>Mobile</Text>
            <Text style={styles.info}>{user?.mobile || ''}</Text>
          </View>
        </View>

        <View style={styles.line} />

        {/* Twitter */}
        <View style={styles.itemRow}>
          <FontAwesome name="twitter" size={22} color="#1DA1F2" />
          <View style={styles.textBox}>
            <Text style={styles.label}>Twitter</Text>
            <Text style={styles.info}>{user?.twitter || ''}</Text>
          </View>
        </View>

        <View style={styles.line} />

        {/* Behance */}
        <View style={styles.itemRow}>
          <FontAwesome5 name="behance" size={22} color="#1769FF" />
          <View style={styles.textBox}>
            <Text style={styles.label}>Behance</Text>
            <Text style={styles.info}>{user?.behance || ''}</Text>
          </View>
        </View>

        <View style={styles.line} />

        {/* Facebook */}
        <View style={styles.itemRow}>
          <FontAwesome name="facebook-square" size={22} color="#1877F2" />
          <View style={styles.textBox}>
            <Text style={styles.label}>Facebook</Text>
            <Text style={styles.info}>{user?.facebook || ''}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F4F7" },

 header: {
  height: 250,
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
  alignItems: "center",
  paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 15, // space for status bar
  position: "relative",
},


  backIcon: { position: "absolute", left: 20, top: 45 },
  settingsIcon: { position: "absolute", right: 20, top: 45 },

  profileText: { color: "#fff", fontSize: 20, fontWeight: "700" },

  profileImage: {
    width: 95,
    height: 95,
    borderRadius: 50,
    marginTop: 5,
    borderWidth: 3,
    borderColor: "#fff",
  },

  name: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 8 },
  role: { color: "#e0e0e0", fontSize: 14, marginTop: 2 },

  statsRow: { flexDirection: "row", marginTop: 15 },
  statBox: { alignItems: "center", width: 120 },

  statNumber: { color: "#fff", fontSize: 20, fontWeight: "700" },
  statLabel: { color: "#e0e0e0", fontSize: 12 },

  card: {
    marginTop: 20,
    backgroundColor: "#fff",
    marginHorizontal: 18,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
  },

  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  textBox: { marginLeft: 15 },

  label: { color: "#777", fontSize: 12 },
  info: { color: "#222", fontSize: 15, marginTop: 1 },

  line: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 5,
  },
});
