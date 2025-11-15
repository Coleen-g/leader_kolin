import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { db, auth } from '../../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import QRCodeSVG from 'react-native-qrcode-svg';

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [eventId]);

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
              {event.attendees && event.attendees.length > 0 && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('EventAttendees', { eventId: event.id })}
                  style={{ paddingLeft: 8 }}
                >
                  <Ionicons name="chevron-forward" size={20} color="#7C3AED" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Description */}
          {event.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {/* QR Code Section - Admin Only */}
          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>Event QR Code</Text>
            <Text style={styles.qrSubtitle}>Scan for check-in</Text>
            <View style={styles.qrCodeContainer}>
              <QRCodeSVG value={event.id} size={240} backgroundColor="#ffffff" color="#0F172A" />
            </View>
            <Text style={styles.eventIdLabel}>Event ID: {event.id}</Text>
          </View>
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
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
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

  qrSection: { alignItems: 'center', paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#E6EEF8' },
  qrSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 16, fontWeight: '500' },
  qrCodeContainer: { alignItems: 'center', marginVertical: 12 },
  qrCodeImage: { width: 240, height: 240, borderRadius: 12, borderWidth: 2, borderColor: '#7C3AED' },
  eventIdLabel: { fontSize: 12, fontWeight: '700', color: '#7C3AED', marginTop: 12 },

  noQrContainer: { alignItems: 'center', paddingVertical: 24, borderTopWidth: 1, borderTopColor: '#E6EEF8' },
  noQrText: { fontSize: 14, color: '#94A3B8', marginTop: 8, fontWeight: '600' },
});
