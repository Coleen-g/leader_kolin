import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from "../../firebase/firebaseConfig";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc, onSnapshot, setDoc } from "firebase/firestore";
import { uploadImageToCloudinary } from '../../utils/cloudinary';

export default function UserProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let unsubDoc = null;
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUser(null);
        setLoading(false);
        if (unsubDoc) unsubDoc();
        return;
      }

      setLoading(true);
      try {
        const userRef = doc(db, 'users', u.uid);
        unsubDoc = onSnapshot(userRef, (snap) => {
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
          setLoading(false);
        }, (err) => {
          console.error('User doc snapshot error:', err);
          setLoading(false);
        });
      } catch (err) {
        console.error('Error subscribing to user doc:', err);
        setLoading(false);
      }
    });

    return () => {
      try { unsub(); } catch (e) {}
      try { if (unsubDoc) unsubDoc(); } catch (e) {}
    };
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
        <TouchableOpacity onPress={async () => {
          try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) return Alert.alert('Permission required', 'Permission to access photos is required to change avatar.');
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.8 });
            if (result.canceled) return;
            const asset = result.assets ? result.assets[0] : result;
            if (!asset || !asset.uri) return;

            setUploading(true);
            console.log('Uploading image to Cloudinary...');
            const uploadedUrl = await uploadImageToCloudinary(asset);
            console.log('Upload result:', uploadedUrl);

            if (!uploadedUrl) {
              Alert.alert('Error', 'Image upload to Cloudinary failed. Please check your Cloudinary preset settings.');
              setUploading(false);
              return;
            }

            const u = auth.currentUser;
            if (u) {
              const userRef = doc(db, 'users', u.uid);
              await updateDoc(userRef, { photoURL: uploadedUrl });
              try { await updateProfile(u, { photoURL: uploadedUrl }); } catch (err) { console.warn('Failed to update auth profile photoURL:', err); }
              setUser((prev) => ({ ...(prev || {}), photoURL: uploadedUrl }));
              Alert.alert('Success', 'Profile photo updated');
            }
          } catch (err) {
            console.error('Error updating avatar:', err);
            Alert.alert('Error', err.message || 'Failed to update avatar');
          } finally {
            setUploading(false);
          }
        }}>
          <Image source={{ uri: user?.photoURL }} style={styles.avatar} />
        </TouchableOpacity>
        {uploading && <ActivityIndicator style={{ position: 'absolute', top: 40 }} size="small" color="#3B82F6" />}
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

        <TouchableOpacity style={styles.settingItem} onPress={() => navigation.getParent()?.navigate('Settings', { screen: 'PrivacySecurity' })}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#3B82F6" />
          <Text style={styles.settingText}>Privacy & Security</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={() => navigation.getParent()?.navigate('Settings', { screen: 'HelpSupport' })}>
          <Ionicons name="help-circle-outline" size={22} color="#3B82F6" />
          <Text style={styles.settingText}>Help & Support</Text>
        </TouchableOpacity>
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