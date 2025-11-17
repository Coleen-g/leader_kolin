import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView, Alert } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { db } from '../../firebase/firebaseConfig';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function NewsDetailScreen({ route }) {
  const navigation = useNavigation();
  const { newsItem } = route.params;

  const [updating, setUpdating] = useState(false);

  const handleAction = async (newStatus) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'news', newsItem.firebaseId), { status: newStatus });
      Alert.alert('Success', `News has been ${newStatus.toLowerCase()}`);
      navigation.goBack();
    } catch (error) {
      console.error('Error updating news:', error);
      Alert.alert('Error', 'Failed to update news');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete News', 'Are you sure you want to delete this news article?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setUpdating(true);
          try {
            await deleteDoc(doc(db, 'news', newsItem.firebaseId));
            Alert.alert('Deleted', 'News article has been deleted', [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('Admin', { screen: 'Manage News' });
                },
              },
            ]);
          } catch (error) {
            console.error('Error deleting news:', error);
            Alert.alert('Error', 'Failed to delete news');
            setUpdating(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 20 }}>
        {newsItem.imageUrl && (
          <Image source={{ uri: newsItem.imageUrl }} style={styles.mainImage} />
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{newsItem.title}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="account" size={16} color="#64748B" />
              <Text style={styles.metaText}>{newsItem.author || 'Unknown'}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="calendar" size={16} color="#64748B" />
              <Text style={styles.metaText}>{newsItem.date || 'Recently'}</Text>
            </View>
          </View>

          {newsItem.category && (
            <TouchableOpacity
              style={styles.categoryBadge}
              onPress={() => {
                const cat = String(newsItem.category || '').toLowerCase();
                if (cat.includes('event') && newsItem.eventId) {
                  navigation.dispatch(
                    CommonActions.navigate({ name: 'EventDetail', params: { eventId: newsItem.eventId } })
                  );
                }
              }}
            >
              <Text style={styles.categoryText}>{newsItem.category}</Text>
            </TouchableOpacity>
          )}

          {newsItem.status && (
            <View
              style={[
                styles.statusBadge,
                newsItem.status === 'Approved'
                  ? styles.statusApproved
                  : newsItem.status === 'Pending'
                  ? styles.statusPending
                  : styles.statusDeclined,
              ]}
            >
              <Text style={styles.statusText}>Status: {newsItem.status}</Text>
            </View>
          )}

          <Text style={styles.contentText}>{newsItem.content}</Text>
        </View>

        {/* Action Buttons */}
        {!newsItem.eventId && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleAction('Declined')}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="close-circle-outline" size={22} color="#fff" />
                  <Text style={styles.actionButtonText}>Decline</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleAction('Approved')}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle-outline" size={22} color="#fff" />
                  <Text style={styles.actionButtonText}>Approve</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="trash-can-outline" size={22} color="#fff" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  scrollView: { flex: 1 },
  mainImage: { width: '100%', height: 280 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 12, lineHeight: 32 },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: { color: '#7C3AED', fontSize: 12, fontWeight: '700' },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  statusApproved: { backgroundColor: '#10B981' },
  statusPending: { backgroundColor: '#F59E0B' },
  statusDeclined: { backgroundColor: '#EF4444' },
  contentText: { fontSize: 16, lineHeight: 26, color: '#475569', marginBottom: 20 },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  declineButton: { backgroundColor: '#EF4444' },
  approveButton: { backgroundColor: '#10B981' },
  deleteButton: { backgroundColor: '#8B5CF6' },
  actionButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
