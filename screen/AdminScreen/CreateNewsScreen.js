import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../../firebase/firebaseConfig';
import { collection, addDoc, Timestamp, doc, getDoc, getDocs } from 'firebase/firestore';
import { uploadImageToCloudinary } from '../../utils/cloudinary';

export default function CreateNewsScreen({ navigation }) {
  const [newsData, setNewsData] = useState({
    title: '',
    content: '',
    image: null,
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user on mount
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
      });
    }
  }, []);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        const cats = snap.docs.map(d => d.data().name).filter(Boolean);
        if (cats.length) {
          setCategories(cats);
          setSelectedCategory(cats[0]);
        } else {
          setCategories(['General']);
          setSelectedCategory('General');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories(['General']);
        setSelectedCategory('General');
      }
    };
    fetchCategories();
  }, []);

  // Fetch current user's role from users collection
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const u = auth.currentUser;
        if (!u) return;
        const userRef = doc(db, 'users', u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setUserRole((data.role || data.type || '').toString());
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
      }
    };
    loadUserRole();
  }, []);

  const handleChange = (field, value) => {
    setNewsData({ ...newsData, [field]: value });
  };

  // Pick image from device
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setNewsData({ ...newsData, image: result.assets[0] });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    const { title, content, image } = newsData;
    
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Fields', 'Please fill in title and content.');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;

      // Upload image to Cloudinary if selected
      if (image) {
        console.log('📸 Starting image upload to Cloudinary...');
        console.log('Image URI:', image.uri);
        console.log('Image size:', image.width, 'x', image.height);
        
        try {
          // Upload to Cloudinary (pass the local URI)
          console.log('Uploading to Cloudinary...');
          imageUrl = await uploadImageToCloudinary(image.uri);
          console.log('✅ Cloudinary upload successful!');
          console.log('Image URL:', imageUrl);
        } catch (uploadError) {
          console.error('❌ Image upload error:', uploadError);
          console.error('Error message:', uploadError.message);
          throw uploadError;
        }
      }

      // Save to Firebase
      const newsDoc = {
        title: title,
        content: content,
        author: currentUser.displayName,
        authorUID: currentUser.uid,
        // Admin posts are auto-approved; editors/posts from others remain Pending
        status: (userRole && userRole.toLowerCase() === 'admin') ? 'Approved' : 'Pending',
        category: selectedCategory || 'General',
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        createdAt: Timestamp.now(),
      };

      // Only include imageUrl if an image was uploaded
      if (imageUrl) {
        newsDoc.imageUrl = imageUrl;
      }

      await addDoc(collection(db, 'news'), newsDoc);

      Alert.alert('Success', 'News article created and sent for approval!');
      setNewsData({ title: '', content: '', image: null });
      navigation.goBack();
    } catch (error) {
      console.error('Error creating news:', error);
      Alert.alert('Error', error.message || 'Failed to create news.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="newspaper-variant-multiple-outline" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.header}>Create News</Text>
            <Text style={styles.subHeader}>Publish a new article</Text>
          </View>
        </View>
      </View>

      {/* Card */}
      <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#667EEA' }]}>
        {/* Current User Info */}
        {currentUser && (
          <View style={styles.userInfoContainer}>
            <MaterialCommunityIcons name="account-circle" size={40} color="#667EEA" />
            <View style={styles.userInfo}>
              <Text style={styles.userInfoLabel}>Author</Text>
              <Text style={styles.userName}>{currentUser.displayName}</Text>
            </View>
          </View>
        )}

        {/* Title */}
        <View style={styles.inputGroup}>
          <MaterialCommunityIcons name="format-title" size={20} color="#667EEA" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter news title"
            value={newsData.title}
            onChangeText={(value) => handleChange('title', value)}
            placeholderTextColor="#CBCBCB"
            editable={!loading}
          />
        </View>

        {/* Image Picker */}
        <TouchableOpacity 
          style={[styles.imagePicker, loading && { opacity: 0.6 }]}
          onPress={pickImage}
          disabled={loading}
        >
          {newsData.image ? (
            <>
              <Image 
                source={{ uri: newsData.image.uri }} 
                style={styles.previewImage}
              />
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={pickImage}
              >
                <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.imagePickerContent}>
              <MaterialCommunityIcons name="image-plus-outline" size={40} color="#667EEA" />
              <Text style={styles.imagePickerText}>Tap to select image</Text>
              <Text style={styles.imagePickerSubtext}>(Optional)</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.inputGroup}>
          <MaterialCommunityIcons name="file-document-outline" size={20} color="#667EEA" style={[styles.inputIcon, { marginTop: 8 }]} />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write the content of the news..."
            multiline
            numberOfLines={8}
            value={newsData.content}
            onChangeText={(value) => handleChange('content', value)}
            placeholderTextColor="#CBCBCB"
            editable={!loading}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="send-outline" size={20} color="#fff" />
              <Text style={styles.submitText}>Publish News</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F0F5FF',
    paddingHorizontal: 16,
  },
  headerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  header: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#1E293B', 
    marginBottom: 2,
  },
  subHeader: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 40,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userInfoLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  inputGroup: { 
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
  },
  inputIcon: {
    marginRight: 10,
    marginTop: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1E293B',
  },
  textArea: { 
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667EEA',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    gap: 8,
  },
  submitText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelText: {
    color: '#667EEA',
    fontWeight: '700',
    fontSize: 16,
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: '#667EEA',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  imagePickerContent: {
    alignItems: 'center',
    gap: 8,
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667EEA',
  },
  imagePickerSubtext: {
    fontSize: 12,
    color: '#94A3B8',
  },
  previewImage: {
    width: '100%',
    height: 160,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#667EEA',
    borderRadius: 20,
    padding: 8,
    elevation: 4,
  },
});