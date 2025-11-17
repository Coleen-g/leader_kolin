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
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCodeSVG from 'react-native-qrcode-svg';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../../firebase/firebaseConfig';
import { collection, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { uploadImageToCloudinary } from '../../utils/cloudinary';

export default function AddEventScreen({ navigation, route }) {
  const prefill = route?.params?.prefill || {};
  const preCategory = route?.params?.category || 'Event';

  const [title, setTitle] = useState(prefill.title || '');
  const [description, setDescription] = useState(prefill.content || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [venue, setVenue] = useState('');
  const [attendanceType, setAttendanceType] = useState('QR');
  const [image, setImage] = useState(prefill.image || null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrUri, setQrUri] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [createdEventId, setCreatedEventId] = useState(null);

  useEffect(() => {
    const u = auth.currentUser;
    if (u) setCurrentUser({ uid: u.uid, displayName: u.displayName || u.email });
  }, []);

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!res.canceled) setImage(res.assets[0]);
    } catch (err) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // QR rendering is done with an on-screen SVG component (no canvas required)

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing fields', 'Please enter title and description');
      return;
    }
    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (image && image.uri) imageUrl = await uploadImageToCloudinary(image.uri);

      const eventDoc = {
        title: title,
        category: preCategory || 'Event',
        date: date || null,
        time: time || null,
        venue: venue || null,
        description: description,
        image: imageUrl || null,
        attendanceType: attendanceType || 'QR',
        attendees: [],
        organizer: currentUser.displayName,
        organizerUID: currentUser.uid,
        status: 'Approved',
        createdAt: Timestamp.now(),
      };

      const eventRef = await addDoc(collection(db, 'events'), eventDoc);
      console.log('Event created:', eventRef.id);

      // QR will be rendered on-screen from the event ID; no canvas generation needed

      // create minimal news link
      const newsDoc = {
        title: title,
        author: currentUser.displayName,
        authorUID: currentUser.uid,
        status: 'Approved',
        category: preCategory,
        eventId: eventRef.id,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        createdAt: Timestamp.now(),
      };
      const newsRef = await addDoc(collection(db, 'news'), newsDoc);
      console.log('News link created:', newsRef.id);

      setCreatedEventId(eventRef.id);
      setShowQRModal(true);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  // Helpers to safely parse stored date/time strings into Date objects
  const parseDateValue = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      const yyyy = parseInt(parts[0], 10);
      const mm = parseInt(parts[1], 10) - 1;
      const dd = parseInt(parts[2], 10);
      const d = new Date(yyyy, mm, dd);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const parseTimeValue = (timeStr) => {
    if (!timeStr) return new Date();
    const parts = String(timeStr).split(':');
    if (parts.length >= 2) {
      const hh = parseInt(parts[0], 10) || 0;
      const mm = parseInt(parts[1], 10) || 0;
      const d = new Date(1970, 0, 1, hh, mm, 0);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    const d = new Date(`1970-01-01T${timeStr}:00`);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Create Event</Text>
          <Text style={styles.sub}>Add event details and generate QR</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons name="format-title" size={20} color="#7C3AED" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Event title" value={title} onChangeText={setTitle} />
          </View>

          <View style={styles.inputGroup}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color="#7C3AED" style={styles.inputIcon} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Description" value={description} onChangeText={setDescription} multiline numberOfLines={6} />
          </View>

          {/* Date Picker Field */}
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons name="calendar" size={20} color="#7C3AED" style={styles.inputIcon} />
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowDatePicker(true)}>
              <Text style={[styles.input, { paddingVertical: 12, color: date ? '#0F172A' : '#A0AEC0' }]}> 
                {date ? date : 'Select Date'}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Time Picker Field */}
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#7C3AED" style={styles.inputIcon} />
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowTimePicker(true)}>
              <Text style={[styles.input, { paddingVertical: 12, color: time ? '#0F172A' : '#A0AEC0' }]}> 
                {time ? time : 'Select Time'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color="#7C3AED" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Venue" value={venue} onChangeText={setVenue} />
          </View>

          <TouchableOpacity style={[styles.imagePicker, loading && { opacity: 0.6 }]} onPress={pickImage} disabled={loading}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePickerContent}>
                <MaterialCommunityIcons name="image-plus-outline" size={40} color="#7C3AED" />
                <Text style={styles.imagePickerText}>Tap to select image (optional)</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={{ marginTop: 8 }}>
            <Text style={{ color: '#6B7280', fontWeight: '600', marginBottom: 8 }}>Attendance</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['QR', 'Manual', 'Location'].map((t) => (
                <TouchableOpacity key={t} onPress={() => setAttendanceType(t)} style={[styles.attendanceBtn, attendanceType === t && styles.attendanceBtnActive]}>
                  <Text style={[styles.attendanceText, attendanceType === t && { color: '#fff' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={[styles.submitButton, loading && { opacity: 0.7 }]} onPress={handleCreate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Create Event</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={loading}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showQRModal} transparent animationType="slide" onRequestClose={() => setShowQRModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Event QR Code</Text>
                <TouchableOpacity onPress={() => setShowQRModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#0F172A" />
                </TouchableOpacity>
              </View>
              {createdEventId && (
                <View style={{ alignItems: 'center', marginVertical: 16 }}>
                  <QRCodeSVG value={createdEventId} size={260} backgroundColor="#ffffff" color="#0F172A" />
                  <Text style={{ color: '#7C3AED', fontWeight: '700', marginTop: 12 }}>Event ID: {createdEventId}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.modalButton} onPress={() => {
                setShowQRModal(false);
                if (createdEventId) navigation.navigate('EventDetail', { eventId: createdEventId });
                else navigation.goBack();
              }}>
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
      {/* DateTimePickers rendered at root level for Android/iOS compatibility */}
      {showDatePicker && (
        <DateTimePicker
          value={parseDateValue(date)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              // Format as YYYY-MM-DD
              const yyyy = selectedDate.getFullYear();
              const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const dd = String(selectedDate.getDate()).padStart(2, '0');
              setDate(`${yyyy}-${mm}-${dd}`);
            }
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={parseTimeValue(time)}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              // Format as HH:MM
              const hh = String(selectedTime.getHours()).padStart(2, '0');
              const min = String(selectedTime.getMinutes()).padStart(2, '0');
              setTime(`${hh}:${min}`);
            }
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  headerRow: { paddingHorizontal: 12, paddingVertical: 16 },
  header: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  sub: { color: '#6B7280', marginTop: 4 },
  card: { marginHorizontal: 8, marginBottom: 40, backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 18, paddingVertical: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 8 },
  inputGroup: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, borderWidth: 1, borderColor: '#E6EEF8', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#FBFDFF' },
  inputIcon: { marginRight: 10, marginTop: 12 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#0F172A' },
  textArea: { paddingVertical: 12, textAlignVertical: 'top' },
  imagePicker: { borderWidth: 1.5, borderColor: '#E6EEF8', borderStyle: 'dashed', borderRadius: 12, marginBottom: 12, minHeight: 140, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBFDFF' },
  imagePickerContent: { alignItems: 'center' },
  imagePickerText: { fontSize: 14, fontWeight: '700', color: '#7C3AED' },
  previewImage: { width: '100%', height: 160, borderRadius: 8 },
  attendanceBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E6EEF8', backgroundColor: '#fff' },
  attendanceBtnActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  attendanceText: { fontSize: 13, color: '#0F172A', fontWeight: '700' },
  submitButton: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cancelButton: { paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E6EEF8', alignItems: 'center', marginTop: 10 },
  cancelText: { color: '#7C3AED', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingVertical: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  modalButton: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
