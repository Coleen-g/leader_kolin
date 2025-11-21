import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

export default function FloatingNewsScreen({ visible, onClose, navigation, newsItem }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const formatEventDateFrom = (ev) => {
    if (!ev) return '';
    const ts = ev?.date?.seconds || ev?.startDate?.seconds || ev?.createdAt?.seconds;
    if (ts) return new Date(ts * 1000).toLocaleDateString();
    return '';
  };

  useEffect(() => {
    // If a specific news item is provided, fetch its latest detail
    let unsubscribe = null;
    setDetail(null);
    setLoading(true);
    if (newsItem && newsItem.id) {
      const docRef = doc(db, 'news', newsItem.id);
      getDoc(docRef)
        .then((snap) => {
          if (snap.exists()) {
            const d = snap.data();
            const detailObj = {
              id: snap.id,
              title: d.title,
              image: d.imageUrl || d.image || null,
              description: d.content || d.description || '',
              authorName: d.author || d.authorName || 'Unknown',
              date: d.createdAt ? new Date(d.createdAt.seconds * 1000).toLocaleDateString() : '',
              raw: d,
            };

            // If the calling component already passed event data, prefer that
            if (newsItem.event) {
              detailObj.event = newsItem.event;
            } else if (d.eventId) {
              // fetch referenced event details
              try {
                getDoc(doc(db, 'events', d.eventId)).then((evSnap) => {
                  if (evSnap.exists()) {
                    detailObj.event = { id: evSnap.id, ...evSnap.data() };
                    setDetail(detailObj);
                    return;
                  }
                  // if no event, still set detail without event
                  setDetail(detailObj);
                }).catch((e) => {
                  console.warn('Failed to fetch referenced event for news detail', e.message);
                  setDetail(detailObj);
                });
                // early return since setDetail will be called in the promise above
                return;
              } catch (e) {
                console.warn('Error fetching event for news detail', e.message);
              }
            }

            setDetail(detailObj);
          } else {
            setDetail(null);
          }
        })
        .catch((err) => console.error('Error fetching news detail:', err))
        .finally(() => setLoading(false));
      return () => {
        // nothing to unsubscribe for single doc get
      };
    }

    if (!visible) return;
    const newsRef = collection(db, 'news');
    const q = query(newsRef, where('status', '==', 'Approved'));
    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          title: d.data().title,
          image: d.data().imageUrl || d.data().image || null,
          description: d.data().content || d.data().description || '',
          authorName: d.data().author || d.data().authorName || 'Unknown',
          date: d.data().createdAt ? new Date(d.data().createdAt.seconds * 1000).toLocaleDateString() : '',
          raw: d.data(),
        }));
        items.sort((a, b) => {
          const ta = a.raw && a.raw.createdAt && a.raw.createdAt.seconds ? a.raw.createdAt.seconds : 0;
          const tb = b.raw && b.raw.createdAt && b.raw.createdAt.seconds ? b.raw.createdAt.seconds : 0;
          return tb - ta;
        });
        setNews(items);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching news for floating screen:', err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [visible, newsItem]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => {
        // Instead of closing the floating overlay immediately, show the
        // article detail inside the panel. Only tapping the backdrop will close.
        (async () => {
          setLoading(true);
          try {
            const detailObj = {
              id: item.id,
              title: item.title,
              image: item.image || null,
              description: item.description || '',
              authorName: item.authorName || 'Unknown',
              date: item.date || '',
              raw: item.raw || null,
            };

            // If the item already has event data attached, use it.
            if (item.event) {
              detailObj.event = item.event;
            } else if (item.raw && item.raw.eventId) {
              // fetch event details
              try {
                const evSnap = await getDoc(doc(db, 'events', item.raw.eventId));
                if (evSnap.exists()) {
                  detailObj.event = { id: evSnap.id, ...evSnap.data() };
                }
              } catch (e) {
                console.warn('Failed to fetch event for item pressed', e.message);
              }
            }

            setDetail(detailObj);
          } finally {
            setLoading(false);
          }
        })();
      }}
    >
      {item.image ? <Image source={{ uri: item.image }} style={styles.thumb} /> : <View style={[styles.thumb, { backgroundColor: '#E6EEF8', justifyContent: 'center', alignItems: 'center' }]}><MaterialCommunityIcons name="image-off-outline" size={28} color="#94A3B8"/></View>}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardMeta}>{item.authorName} • {item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={!!visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{newsItem ? 'Article' : 'All News'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingWrap}><ActivityIndicator size="small" color="#7C3AED" /></View>
          ) : (
            detail ? (
              <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ padding: 12 }}>
                {detail.image ? <Image source={{ uri: detail.image }} style={{ width: '100%', height: 180, borderRadius: 10, marginBottom: 12 }} /> : null}
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 8 }}>{detail.title}</Text>
                <Text style={{ color: '#64748B', marginBottom: 12 }}>{detail.authorName} • {detail.date}</Text>
                <Text style={{ color: '#0F172A', lineHeight: 22 }}>{detail.description || 'No content available.'}</Text>
                {detail.event ? (
                  <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 8 }}>Event Info</Text>
                    { (detail.event.imageUrl || detail.event.image) ? (
                      <Image source={{ uri: detail.event.imageUrl || detail.event.image }} style={{ width: '100%', height: 160, borderRadius: 10, marginBottom: 10 }} />
                    ) : null }
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A' }}>{detail.event.title || detail.event.name || detail.event.eventName || 'Event'}</Text>
                    <Text style={{ color: '#64748B', marginBottom: 8 }}>{formatEventDateFrom(detail.event)}{detail.event.location ? ` • ${detail.event.location}` : ''}</Text>
                    <Text style={{ color: '#0F172A', lineHeight: 20 }}>{detail.event.description || detail.event.details || 'No event details available.'}</Text>
                  </View>
                ) : null}
              </ScrollView>
            ) : (
              <FlatList
                data={news}
                keyExtractor={(i) => i.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
              />
            )
          )}
            </View>
          </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(7,12,20,0.45)', justifyContent: 'center', alignItems: 'center' },
  panel: { width: Math.min(WINDOW_WIDTH - 40, 760), maxHeight: WINDOW_HEIGHT - 120, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  closeBtn: { padding: 6 },
  loadingWrap: { padding: 20, alignItems: 'center' },
  card: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
  thumb: { width: 84, height: 64, borderRadius: 8, marginRight: 12, backgroundColor: '#E6EEF8' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  cardMeta: { color: '#64748B', fontSize: 12, marginTop: 6 },
});
