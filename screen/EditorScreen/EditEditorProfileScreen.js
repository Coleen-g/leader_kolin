import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert, SafeAreaView } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from "@react-navigation/native";
import { auth, db } from '../../firebase/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { uploadImageToCloudinary } from '../../utils/cloudinary';

export default function EditEditorProfileScreen({ route }) {
  const navigation = useNavigation();
  const { uid } = route.params;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [editData, setEditData] = useState({
    displayName: '',
    mobile: '',
    twitter: '',
    behance: '',
    facebook: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setUser(data);
          setEditData({
            displayName: data.displayName || data.name || '',
            mobile: data.mobile || '',
            twitter: data.twitter || '',
            behance: data.behance || '',
            facebook: data.facebook || '',
          });
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [uid]);

  const handleChangePhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert('Permission required', 'Permission to access photos is required.');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled) return;
      const asset = result.assets ? result.assets[0] : result;
      if (!asset || !asset.uri) return;

      setUploading(true);
      const uploadedUrl = await uploadImageToCloudinary(asset);

      if (!uploadedUrl) {
        Alert.alert('Error', 'Image upload to Cloudinary failed.');
        setUploading(false);
        return;
      }

      const u = auth.currentUser;
      if (u) {
        const userRef = doc(db, 'users', u.uid);
        await updateDoc(userRef, { photoURL: uploadedUrl });
        try {
          await updateProfile(u, { photoURL: uploadedUrl });
        } catch (err) {
          console.warn('Failed to update auth photoURL:', err);
        }
        setUser((prev) => ({ ...(prev || {}), photoURL: uploadedUrl }));
        Alert.alert('Success', 'Profile photo updated');
      }
    } catch (err) {
      console.error('Error changing photo:', err);
      Alert.alert('Error', err.message || 'Failed to change photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!editData.displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    try {
      setUploading(true);
      const u = auth.currentUser;
      if (u) {
        const userRef = doc(db, 'users', u.uid);
        await updateDoc(userRef, {
          displayName: editData.displayName,
          name: editData.displayName,
          mobile: editData.mobile,
          twitter: editData.twitter,
          behance: editData.behance,
          facebook: editData.facebook,
        });

        try {
          await updateProfile(u, { displayName: editData.displayName });
        } catch (err) {
          console.warn('Failed to update auth profile:', err);
        }

        Alert.alert('Success', 'Profile updated successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (err) {
      console.error('Error saving changes:', err);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#667EEA" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Profile Picture Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={handleChangePhoto} disabled={uploading}>
            <Image
              source={{ uri: user?.photoURL }}
              style={styles.profileImage}
            />
            {uploading && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            )}
            {!uploading && (
              <View style={styles.cameraOverlay}>
                <Ionicons name="camera" size={24} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoHint}>Tap to change photo</Text>
        </View>

        {/* Edit Fields */}
        <View style={styles.form}>
          {/* Display Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={editData.displayName}
              onChangeText={(text) => setEditData({ ...editData, displayName: text })}
              placeholder="Enter display name"
            />
          </View>

          {/* Mobile */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mobile</Text>
            <TextInput
              style={styles.input}
              value={editData.mobile}
              onChangeText={(text) => setEditData({ ...editData, mobile: text })}
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
            />
          </View>

          {/* Twitter */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Twitter</Text>
            <TextInput
              style={styles.input}
              value={editData.twitter}
              onChangeText={(text) => setEditData({ ...editData, twitter: text })}
              placeholder="Enter Twitter handle"
            />
          </View>

          {/* Behance */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Behance</Text>
            <TextInput
              style={styles.input}
              value={editData.behance}
              onChangeText={(text) => setEditData({ ...editData, behance: text })}
              placeholder="Enter Behance URL"
            />
          </View>

          {/* Facebook */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Facebook</Text>
            <TextInput
              style={styles.input}
              value={editData.facebook}
              onChangeText={(text) => setEditData({ ...editData, facebook: text })}
              placeholder="Enter Facebook URL"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, uploading && { opacity: 0.6 }]}
            onPress={handleSaveChanges}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },

  photoSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#667EEA',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoHint: { fontSize: 12, color: '#94A3B8', marginTop: 8 },

  form: { paddingHorizontal: 16 },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#fff',
  },

  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#667EEA',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
