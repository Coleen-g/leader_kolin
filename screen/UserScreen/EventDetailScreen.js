import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { db, auth } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() });
        } else {
          Alert.alert('Error', 'Event not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        Alert.alert('Error', 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();

    const u = auth.currentUser;
    if (u) {
      setCurrentUser({ uid: u.uid, displayName: u.displayName || u.email });
    }
  }, [eventId]);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || scanLoading) return;
    
    setScanLoading(true);
    setScanned(true);

    try {
      if (!event) {
        Alert.alert('Error', 'Event not loaded');
        return;
      }

      if (!currentUser) {
        Alert.alert('Sign in', 'Please sign in to record attendance');
        return;
      }

      const payload = String(data || '');
      
      // Check if QR code matches event ID
      if (payload === event.id || payload.includes(event.id)) {
        const eventRef = doc(db, 'events', event.id);
        await updateDoc(eventRef, {
          attendees: arrayUnion({
            uid: currentUser.uid,
            name: currentUser.displayName,
            scannedAt: Timestamp.now(),
          }),
        });
        
        Alert.alert('Success', 'Your attendance has been registered!');
        setCameraVisible(false);
        setScanned(false);
      } else {
        Alert.alert('Invalid QR', 'This QR code does not match this event');
        setScanned(false);
      }
    } catch (err) {
      console.error('Scan error:', err);
      Alert.alert('Error', 'Failed to record attendance');
      setScanned(false);
    } finally {
      setScanLoading(false);
    }
  };

  const handleCameraOpen = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to scan QR codes');
        return;
      }
    }
    setCameraVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.card}>
          <View style={styles.headerSection}>
            <View style={styles.categoryBadge}>
              <MaterialCommunityIcons name="calendar-check" size={16} color="#7C3AED" />
              <Text style={styles.categoryText}>{event.category || 'Event'}</Text>
            </View>
            <Text style={styles.title}>{event.title}</Text>
          </View>

          {/* Action buttons for users: Add Favorite and Scan QR */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
            <TouchableOpacity
              style={{ backgroundColor: '#7C3AED', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}
              onPress={async () => {
                try {
                  if (!currentUser) return Alert.alert('Sign in', 'Please sign in to add favorites');
                  const userRef = doc(db, 'users', currentUser.uid);
                  await updateDoc(userRef, { favorites: arrayUnion(event.id) });
                  Alert.alert('Saved', 'Event added to favorites');
                } catch (err) {
                  console.error('Failed to add favorite', err);
                  Alert.alert('Error', 'Failed to add favorite');
                }
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Add Favorite</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ backgroundColor: '#10B981', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginLeft: 8 }}
              onPress={handleCameraOpen}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Scan QR</Text>
            </TouchableOpacity>
          </View>

          {/* Event Details Grid */}
          <View style={styles.detailsGrid}>
            {event.date && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="calendar" size={20} color="#7C3AED" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{event.date}</Text>
                </View>
              </View>
            )}

            {event.time && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="clock" size={20} color="#7C3AED" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>{event.time}</Text>
                </View>
              </View>
            )}

            {event.venue && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#7C3AED" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Venue</Text>
                  <Text style={styles.detailValue}>{event.venue}</Text>
                </View>
              </View>
            )}

            {event.organizer && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="account" size={20} color="#7C3AED" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Organizer</Text>
                  <Text style={styles.detailValue}>{event.organizer}</Text>
                </View>
              </View>
            )}

            {event.attendanceType && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="qrcode" size={20} color="#7C3AED" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Attendance Type</Text>
                  <Text style={styles.detailValue}>{event.attendanceType}</Text>
                </View>
              </View>
            )}

            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="account-multiple" size={20} color="#7C3AED" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Attendees</Text>
                <Text style={styles.detailValue}>{event.attendees?.length || 0}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {event.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* QR Code Scanner Modal */}
      <Modal visible={cameraVisible} animationType="slide" transparent={false}>
        {cameraVisible && permission?.granted && (
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFill}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            />
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanText}>Align QR Code</Text>

              {scanned && !scanLoading && (
                <TouchableOpacity
                  style={styles.rescanButton}
                  onPress={() => setScanned(false)}
                >
                  <Text style={styles.rescanButtonText}>Tap to Rescan</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.rescanButton,
                  { bottom: 80, backgroundColor: '#F87171' },
                ]}
                onPress={() => {
                  setCameraVisible(false);
                  setScanned(false);
                }}
              >
                <Text style={styles.rescanButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#EF4444' },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2 },

  headerSection: { marginBottom: 20 },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: { color: '#7C3AED', fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', lineHeight: 28 },

  detailsGrid: { marginBottom: 20 },
  detailItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E6EEF8' },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  detailValue: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginTop: 2 },

  descriptionSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  description: { fontSize: 14, lineHeight: 22, color: '#475569' },

  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  cameraContainer: { flex: 1, backgroundColor: '#000' },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
  },
  rescanButton: {
    position: 'absolute',
    bottom: 180,
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  rescanButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
