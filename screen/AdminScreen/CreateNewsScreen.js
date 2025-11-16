import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import QRCodeSVG from 'react-native-qrcode-svg';
import { auth, db } from '../../firebase/firebaseConfig';
import { collection, addDoc, Timestamp, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { uploadImageToCloudinary } from '../../utils/cloudinary';

export default function CreateNewsScreen({ navigation }) {
  const [newsData, setNewsData] = useState({ title: '', content: '', image: null });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [venue, setVenue] = useState('');
  const [attendanceType, setAttendanceType] = useState('QR');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [qrCodeUri, setQrCodeUri] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [eventId, setEventId] = useState(null);
  // treat 'Event' and 'Events' (case-insensitive) as event-type for AddEvent redirection
  const EVENT_CATEGORIES = ['event', 'events'];

  const isEventCategory = (cat) => {
    if (!cat) return false;
    return EVENT_CATEGORIES.includes(cat.toString().toLowerCase().trim());
  };

  useEffect(() => {
    const u = auth.currentUser;
    if (u) setCurrentUser({ uid: u.uid, email: u.email, displayName: u.displayName || u.email });
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        const cats = snap.docs.map((d) => d.data().name).filter(Boolean);
        if (!mounted) return;
        if (cats.length) {
          setCategories(cats);
          setSelectedCategory((prev) => (prev && prev !== 'General' ? prev : cats[0]));
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
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const u = auth.currentUser;
        if (!u) return;
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) setUserRole((snap.data().role || snap.data().type || '').toString());
      } catch (err) {
        console.error('Error loading role', err);
      }
    };
    loadUserRole();
  }, []);

  const handleChange = (field, value) => setNewsData({ ...newsData, [field]: value });

  const handleCategorySelect = (cat) => {
    if (isEventCategory(cat)) {
      // navigate to AddEvent screen and pass current draft as prefill
      navigation.navigate('AddEvent', { category: cat, prefill: { title: newsData.title, content: newsData.content, image: newsData.image } });
    } else {
      setSelectedCategory(cat);
    }
  };

  // QR image generation handled by on-screen SVG component; no canvas needed

  const pickImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setNewsData({ ...newsData, image: result.assets[0] }); // keep object with uri, width, height
  } catch (e) {
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
    if (image) {
      // Pass the full image object directly to the updated Cloudinary function
      imageUrl = await uploadImageToCloudinary(image);
      console.log('Uploaded image URL:', imageUrl);
    }

    const isEvent = isEventCategory(selectedCategory);

    if (isEvent) {
      const eventDoc = {
        title: newsData.title,
        category: selectedCategory || 'Event',
        date: eventDate || null,
        time: eventTime || null,
        venue: venue || null,
        description: newsData.content,
        image: imageUrl || null, // Cloudinary URL
        attendanceType: attendanceType || 'QR',
        attendees: [],
        organizer: currentUser.displayName,
        organizerUID: currentUser.uid,
        status: 'Approved',
        createdAt: Timestamp.now(),
      };
      const eventRef = await addDoc(collection(db, 'events'), eventDoc);

      const newsDoc = {
        title: newsData.title,
        author: currentUser.displayName,
        authorUID: currentUser.uid,
        status: 'Approved',
        category: selectedCategory,
        eventId: eventRef.id,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        createdAt: Timestamp.now(),
      };
      await addDoc(collection(db, 'news'), newsDoc);

      setEventId(eventRef.id);
      setShowQRModal(true);
    } else {
      const newsDoc = {
        title: newsData.title,
        content: newsData.content,
        author: currentUser.displayName,
        authorUID: currentUser.uid,
        status: 'Approved',
        category: selectedCategory || 'General',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        createdAt: Timestamp.now(),
      };
      if (imageUrl) newsDoc.imageUrl = imageUrl; // Cloudinary URL

      await addDoc(collection(db, 'news'), newsDoc);

      Alert.alert('Success', 'Article created.');
      setNewsData({ title: '', content: '', image: null });
      navigation.goBack();
    }
  } catch (err) {
    console.error(err);
    Alert.alert('Error', err.message || 'Failed to create news/event.');
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
            <Text style={styles.header}>Create News / Event</Text>
            <Text style={styles.subHeader}>Publish content or create an event</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        {currentUser && (
          <View style={styles.userInfoContainer}>
            <MaterialCommunityIcons name="account-circle" size={40} color="#7C3AED" />
            <View style={styles.userInfo}>
              <Text style={styles.userInfoLabel}>Author</Text>
              <Text style={styles.userName}>{currentUser.displayName}</Text>
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <MaterialCommunityIcons name="format-title" size={20} color="#7C3AED" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter title"
            value={newsData.title}
            onChangeText={(v) => handleChange('title', v)}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.categoryContainer}>
          <Text style={styles.categoryLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                onPress={() => handleCategorySelect(cat)}
                disabled={loading}
              >
                <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={[styles.imagePicker, loading && { opacity: 0.6 }]} onPress={pickImage} disabled={loading}>
          {newsData.image ? (
            <>
              <Image source={{ uri: newsData.image.uri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
                <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.imagePickerContent}>
              <MaterialCommunityIcons name="image-plus-outline" size={40} color="#7C3AED" />
              <Text style={styles.imagePickerText}>Tap to select image (optional)</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <MaterialCommunityIcons name="file-document-outline" size={20} color="#7C3AED" style={[styles.inputIcon, { marginTop: 8 }]} />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write the content..."
            multiline
            numberOfLines={6}
            value={newsData.content}
            onChangeText={(v) => handleChange('content', v)}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {isEventCategory(selectedCategory) && (
          <View>
            <Text style={styles.sectionTitle}>Event Details</Text>
            <View style={styles.inputGroup}>
              <MaterialCommunityIcons name="calendar" size={20} color="#7C3AED" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={eventDate} onChangeText={setEventDate} placeholderTextColor="#9CA3AF" />
            </View>
            <View style={styles.inputGroup}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#7C3AED" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Time (HH:MM)" value={eventTime} onChangeText={setEventTime} placeholderTextColor="#9CA3AF" />
            </View>
            <View style={styles.inputGroup}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color="#7C3AED" style={styles.inputIcon} />
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

        <TouchableOpacity style={[styles.submitButton, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Publish</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={loading}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowQRModal(false);
          setQrCodeUri(null);
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
                  setQrCodeUri(null);
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
                // Close the modal then navigate to EventDetail for the created event
                const idToOpen = eventId;
                setShowQRModal(false);
                setQrCodeUri(null);
                setEventId(null);
                if (idToOpen) {
                  navigation.navigate('EventDetail', { eventId: idToOpen });
                } else {
                  navigation.goBack();
                }
              }}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  headerContainer: { paddingHorizontal: 12, paddingVertical: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  badge: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  header: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  subHeader: { fontSize: 12, color: '#6B7280' },
  card: { marginHorizontal: 8, marginBottom: 40, backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 18, paddingVertical: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 8 },
  userInfoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E6EEF8', paddingBottom: 12 },
  userInfo: { flex: 1 },
  userInfoLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  userName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  inputGroup: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, borderWidth: 1, borderColor: '#E6EEF8', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#FBFDFF' },
  inputIcon: { marginRight: 10, marginTop: 12 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#0F172A' },
  textArea: { paddingVertical: 12, textAlignVertical: 'top' },
  categoryContainer: { marginBottom: 12 },
  categoryLabel: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5FE', borderWidth: 1, borderColor: '#E6EEF8' },
  categoryChipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  categoryChipText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  categoryChipTextActive: { color: '#fff' },
  imagePicker: { borderWidth: 1.5, borderColor: '#E6EEF8', borderStyle: 'dashed', borderRadius: 12, marginBottom: 12, minHeight: 140, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBFDFF' },
  imagePickerContent: { alignItems: 'center' },
  imagePickerText: { fontSize: 14, fontWeight: '700', color: '#7C3AED' },
  previewImage: { width: '100%', height: 160, borderRadius: 8 },
  changeImageButton: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#7C3AED', borderRadius: 20, padding: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  attendanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  attendanceBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E6EEF8', backgroundColor: '#fff' },
  attendanceBtnActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  attendanceText: { fontSize: 13, color: '#0F172A', fontWeight: '700' },
  submitButton: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cancelButton: { paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E6EEF8', alignItems: 'center', marginTop: 10 },
  cancelText: { color: '#7C3AED', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingVertical: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E6EEF8' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  qrContainer: { alignItems: 'center', marginVertical: 20 },
  qrSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 16, fontWeight: '600' },
  qrImage: { width: 280, height: 280, marginVertical: 16, borderRadius: 12, borderWidth: 2, borderColor: '#7C3AED' },
  eventIdText: { fontSize: 13, fontWeight: '700', color: '#7C3AED', marginTop: 12, marginBottom: 16 },
  instructionText: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  modalButton: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});