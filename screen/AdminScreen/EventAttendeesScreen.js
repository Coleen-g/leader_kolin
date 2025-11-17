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
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase/firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

export default function EventAttendeesScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [attendeeDetails, setAttendeeDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  // extract fetch to a reusable function so we can call it after dedupe
  const fetchEventAndAttendees = async () => {
    setLoading(true);
    try {
      // Fetch event details
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        const eventData = { id: eventDoc.id, ...eventDoc.data() };
        setEvent(eventData);

        // Get attendees array from event
        const attendeesArray = eventData.attendees || [];
        setAttendees(attendeesArray);

        // Fetch user details for each attendee
        const attendeeList = [];
        for (const attendee of attendeesArray) {
          try {
            const userDoc = await getDoc(doc(db, 'users', attendee.uid));
            if (userDoc.exists()) {
              attendeeList.push({
                uid: attendee.uid,
                displayName: attendee.name || userDoc.data().displayName || 'Unknown',
                email: userDoc.data().email || 'N/A',
                photoURL: userDoc.data().photoURL || 'https://i.pravatar.cc/100',
                scannedAt: attendee.scannedAt,
              });
            } else {
              attendeeList.push({
                uid: attendee.uid,
                displayName: attendee.name || 'Unknown User',
                email: 'N/A',
                photoURL: 'https://i.pravatar.cc/100',
                scannedAt: attendee.scannedAt,
              });
            }
          } catch (err) {
            console.error('Error fetching user:', attendee.uid, err);
            attendeeList.push({
              uid: attendee.uid,
              displayName: attendee.name || 'Unknown User',
              email: 'N/A',
              photoURL: 'https://i.pravatar.cc/100',
              scannedAt: attendee.scannedAt,
            });
          }
        }
        setAttendeeDetails(attendeeList);
      } else {
        Alert.alert('Error', 'Event not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching event or attendees:', error);
      Alert.alert('Error', 'Failed to load attendees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventAndAttendees();
  }, [eventId]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch (err) {
      return 'N/A';
    }
  };

  const renderAttendeeItem = ({ item }) => (
    <View style={styles.attendeeCard}>
      <Image
        source={{ uri: item.photoURL }}
        style={styles.attendeeAvatar}
      />
      <View style={styles.attendeeInfo}>
        <Text style={styles.attendeeName}>{item.displayName}</Text>
        <Text style={styles.attendeeEmail}>{item.email}</Text>
        <Text style={styles.attendeeTime}>Checked in: {formatDate(item.scannedAt)}</Text>
      </View>
      <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Event Header */}
        {event && (
          <View style={styles.eventHeader}>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>{event.date} • {event.time}</Text>
            </View>
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={async () => {
                // Confirm
                Alert.alert('Remove duplicates', 'This will remove duplicate attendee entries (keep earliest). Continue?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Yes', onPress: async () => {
                    try {
                      setLoading(true);
                      const eventRef = doc(db, 'events', eventId);
                      const eDoc = await getDoc(eventRef);
                      if (!eDoc.exists()) {
                        Alert.alert('Error', 'Event not found');
                        setLoading(false);
                        return;
                      }
                      const arr = eDoc.data().attendees || [];
                      const map = new Map();
                      // keep earliest scannedAt (first occurrence)
                      for (const a of arr) {
                        if (!a || !a.uid) continue;
                        if (!map.has(a.uid)) map.set(a.uid, a);
                        else {
                          // compare scannedAt if present and keep earliest
                          try {
                            const existing = map.get(a.uid);
                            const existingTime = existing?.scannedAt?.toDate ? existing.scannedAt.toDate().getTime() : (new Date(existing.scannedAt || 0)).getTime();
                            const newTime = a?.scannedAt?.toDate ? a.scannedAt.toDate().getTime() : (new Date(a.scannedAt || 0)).getTime();
                            if (newTime < existingTime) map.set(a.uid, a);
                          } catch (err) { /* ignore */ }
                        }
                      }
                      const deduped = Array.from(map.values());
                      if (deduped.length === arr.length) {
                        Alert.alert('No duplicates', 'No duplicate attendees were found');
                        setLoading(false);
                        return;
                      }
                      await updateDoc(eventRef, { attendees: deduped });
                      Alert.alert('Done', `Removed ${arr.length - deduped.length} duplicate(s)`);
                      // refresh
                      await fetchEventAndAttendees();
                    } catch (err) {
                      console.error('Error deduping attendees:', err);
                      Alert.alert('Error', 'Failed to remove duplicates');
                    } finally {
                      setLoading(false);
                    }
                  }}
                ]);
              }}
            >
              <MaterialCommunityIcons name="database-refresh" size={22} color="#7C3AED" />
            </TouchableOpacity>
          </View>
        )}

        {/* Attendees Count */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="account-multiple" size={32} color="#7C3AED" />
            <Text style={styles.statNumber}>{attendeeDetails.length}</Text>
            <Text style={styles.statLabel}>Total Attendees</Text>
          </View>
        </View>

        {/* Attendees List */}
        <View style={styles.attendeesSection}>
          <Text style={styles.sectionTitle}>Event Attendees</Text>
          {attendeeDetails.length > 0 ? (
            <FlatList
              data={attendeeDetails}
              renderItem={renderAttendeeItem}
              keyExtractor={(item, index) => `${item.uid}_${index}`}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-off" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No attendees yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: { marginRight: 12 },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  eventDate: { fontSize: 12, color: '#64748B' },

  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: { fontSize: 32, fontWeight: '800', color: '#7C3AED', marginVertical: 8 },
  statLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },

  attendeesSection: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },

  attendeeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 1,
  },
  attendeeAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  attendeeInfo: { flex: 1 },
  attendeeName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  attendeeEmail: { fontSize: 12, color: '#64748B', marginTop: 2 },
  attendeeTime: { fontSize: 11, color: '#94A3B8', marginTop: 4, fontStyle: 'italic' },

  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#94A3B8', marginTop: 12 },
});
