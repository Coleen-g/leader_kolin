import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { uploadImageToCloudinary } from '../../utils/cloudinary';

export default function EditUserScreen({ route, navigation }) {
  const { uid } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [photoURL, setPhotoURL] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!uid) {
        Alert.alert('Error', 'No user id provided');
        navigation.goBack();
        return;
      }
      setLoading(true);
      try {
        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (!mounted) return;
          setDisplayName(data.displayName || data.name || '');
          setUsername(data.username || data.handle || '');
          setEmail(data.email || '');
          setPhotoURL(data.photoURL || null);
        } else {
          // fallback to auth
          const u = auth.currentUser;
          setDisplayName(u?.displayName || '');
          setUsername('');
          setEmail(u?.email || '');
          setPhotoURL(u?.photoURL || null);
        }
      } catch (err) {
        console.error('Error loading user for edit:', err);
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [uid]);

  const handleSave = async () => {
    if (!uid) return;
    if (!displayName.trim()) return Alert.alert('Validation', 'Display name is required');
    setSaving(true);
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        displayName: displayName.trim(),
        username: username.trim() || undefined,
      });

      // update auth profile if current user
      const u = auth.currentUser;
      if (u && u.uid === uid) {
        try {
          await updateProfile(u, { displayName: displayName.trim() });
        } catch (err) {
          console.warn('Failed to update auth profile displayName:', err);
        }
      }

      Alert.alert('Saved', 'Profile updated successfully');
      navigation.goBack();
    } catch (err) {
      console.error('Error saving user:', err);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert('Permission required', 'Permission to access photos is required to change avatar.');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.8 });
      if (result.canceled) return;
      const asset = result.assets ? result.assets[0] : result;
      if (!asset || !asset.uri) return;

      setUploading(true);
      const uploadedUrl = await uploadImageToCloudinary(asset);

      if (uid) {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { photoURL: uploadedUrl });
        const u = auth.currentUser;
        if (u && u.uid === uid) {
          try { await updateProfile(u, { photoURL: uploadedUrl }); } catch (err) { console.warn('Failed to update auth profile photoURL:', err); }
        }
        setPhotoURL(uploadedUrl);
        Alert.alert('Success', 'Profile photo updated');
      }
    } catch (err) {
      console.error('Error updating photo:', err);
      Alert.alert('Error', 'Failed to update photo');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={26} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.card}>
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={handleChangePhoto} style={{ alignItems: 'center' }}>
            <View style={{ width: 96, height: 96, borderRadius: 48, overflow: 'hidden', marginBottom: 8 }}>
              <Image source={{ uri: photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={{ width: '100%', height: '100%' }} />
            </View>
            <Text style={{ color: '#7C3AED', fontWeight: '700' }}>Change Photo</Text>
          </TouchableOpacity>
          {uploading && <ActivityIndicator style={{ marginTop: 8 }} size="small" color="#7C3AED" />}
        </View>
        <Text style={styles.label}>Display Name</Text>
        <TextInput value={displayName} onChangeText={setDisplayName} style={styles.input} placeholder="Display name" />

        <Text style={styles.label}>Username</Text>
        <TextInput value={username} onChangeText={setUsername} style={styles.input} placeholder="@username" />

        <Text style={styles.label}>Email</Text>
        <TextInput value={email} editable={false} style={[styles.input, { backgroundColor: '#F1F5F9' }]} />

        <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  card: { margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 4 },
  label: { fontSize: 13, color: '#64748B', marginTop: 8, marginBottom: 6, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#E6EEF8', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FBFDFF' },
  saveButton: { marginTop: 16, backgroundColor: '#7C3AED', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '800' },
});
