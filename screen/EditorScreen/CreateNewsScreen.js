import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import QRCodeSVG from 'react-native-qrcode-svg';
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
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [venue, setVenue] = useState('');
  const [attendanceType, setAttendanceType] = useState('QR');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [eventId, setEventId] = useState(null);
  
  // Treat 'Event' and 'Events' (case-insensitive) as event-type
  const EVENT_CATEGORIES = ['event', 'events'];

  const isEventCategory = (cat) => {
    if (!cat) return false;
    return EVENT_CATEGORIES.includes(cat.toString().toLowerCase().trim());
  };

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

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
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

      const isEvent = isEventCategory(selectedCategory);

      if (isEvent) {
        // Create event in events collection
        const eventDoc = {
          title: newsData.title,
          category: selectedCategory || 'Event',
          date: eventDate || null,
          time: eventTime || null,
          venue: venue || null,
          description: newsData.content,
          image: imageUrl || null,
          attendanceType: attendanceType || 'QR',
          attendees: [],
          organizer: currentUser.displayName,
          organizerUID: currentUser.uid,
          status: 'Pending', // Editor events are Pending until admin approves
          createdAt: Timestamp.now(),
        };
        const eventRef = await addDoc(collection(db, 'events'), eventDoc);

        // Create news entry for event
        const newsDoc = {
          title: newsData.title,
          author: currentUser.displayName,
          authorUID: currentUser.uid,
          status: 'Pending', // Editor events are Pending until admin approves
          category: selectedCategory,
          eventId: eventRef.id,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          createdAt: Timestamp.now(),
        };
        await addDoc(collection(db, 'news'), newsDoc);

        // Only show QR modal if user is admin
        if (userRole && userRole.toLowerCase() === 'admin') {
          setEventId(eventRef.id);
          setShowQRModal(true);
        } else {
          Alert.alert('Success', 'Event created and sent for approval!');
          setNewsData({ title: '', content: '', image: null });
          setEventDate('');
          setEventTime('');
          setVenue('');
          navigation.goBack();
        }
      } else {
        // Regular article
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

        Alert.alert('Success', 'Article created and sent for approval!');
        setNewsData({ title: '', content: '', image: null });
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error creating article:', error);
      Alert.alert('Error', error.message || 'Failed to create article.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="newspaper-variant-multiple-outline" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.header}>Create Article</Text>
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
            placeholder="Enter article title"
            value={newsData.title}
            onChangeText={(value) => handleChange('title', value)}
            placeholderTextColor="#CBCBCB"
            editable={!loading}
          />
        </View>

        {/* Category Selector */}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryLabel}>Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat && styles.categoryChipActive,
                ]}
                onPress={() => handleCategorySelect(cat)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
            placeholder="Write the content of the article..."
            multiline
            numberOfLines={8}
            value={newsData.content}
            onChangeText={(value) => handleChange('content', value)}
            placeholderTextColor="#CBCBCB"
            editable={!loading}
          />
        </View>

        {/* Event Details (shown only when Event category is selected) */}
        {isEventCategory(selectedCategory) && (
          <View>
            <Text style={styles.sectionTitle}>Event Details</Text>
            <View style={styles.inputGroup}>
              <MaterialCommunityIcons name="calendar" size={20} color="#667EEA" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={eventDate} onChangeText={setEventDate} placeholderTextColor="#9CA3AF" />
            </View>
            <View style={styles.inputGroup}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#667EEA" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Time (HH:MM)" value={eventTime} onChangeText={setEventTime} placeholderTextColor="#9CA3AF" />
            </View>
            <View style={styles.inputGroup}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color="#667EEA" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Venue" value={venue} onChangeText={setVenue} placeholderTextColor="#9CA3AF" />
            </View>
            <View style={styles.attendanceRow}>
              <Text style={{ color: '#6B7280', fontWeight: '600' }}>Attendance</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['QR', 'Manual', 'Location'].map((t) => (
                  <TouchableOpacity key={t} onPress={() => setAttendanceType(t)} style={[styles.attendanceBtn, attendanceType === t && styles.attendanceBtnActive]}>
                    <Text style={[styles.attendanceText, attendanceType === t && { color: '#fff' }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

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
              <Text style={styles.submitText}>Publish Article</Text>
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

      {/* QR Code Modal - Only show for admins */}
      {userRole && userRole.toLowerCase() === 'admin' && (
        <Modal
          visible={showQRModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setShowQRModal(false);
            setEventId(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Event QR Code Generated</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowQRModal(false);
                    setEventId(null);
                  }}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#0F172A" />
                </TouchableOpacity>
              </View>

              {eventId && (
                <View style={styles.qrContainer}>
                  <Text style={styles.qrSubtitle}>Scan this code for event check-in</Text>
                  <View style={{ marginVertical: 12 }}>
                    <QRCodeSVG value={eventId} size={260} backgroundColor="#ffffff" color="#0F172A" />
                  </View>
                  <Text style={styles.eventIdText}>Event ID: {eventId}</Text>
                  <Text style={styles.instructionText}>
                    Users can scan this QR code to attend the event. The code links to this event's unique ID.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowQRModal(false);
                  setEventId(null);
                  Alert.alert('Success', 'Event created and sent for approval!');
                  setNewsData({ title: '', content: '', image: null });
                  setEventDate('');
                  setEventTime('');
                  setVenue('');
                  navigation.goBack();
                }}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F0F5FF',
    paddingHorizontal: 12,
  },
  headerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  header: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#1E293B', 
    marginBottom: 2,
  },
  subHeader: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  card: {
    marginHorizontal: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userInfoLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  inputGroup: { 
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
  },
  inputIcon: {
    marginRight: 10,
    marginTop: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E293B',
  },
  textArea: { 
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667EEA',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 10,
    gap: 8,
  },
  submitText: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelText: {
    color: '#667EEA',
    fontWeight: '700',
    fontSize: 15,
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: '#667EEA',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 14,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  imagePickerContent: {
    alignItems: 'center',
    gap: 6,
  },
  imagePickerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#667EEA',
  },
  imagePickerSubtext: {
    fontSize: 11,
    color: '#94A3B8',
  },
  previewImage: {
    width: '100%',
    height: 140,
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
  categoryContainer: {
    marginBottom: 14,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  categoryScroll: {
    maxHeight: 42,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5FE',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
});