import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AboutCreatorScreen({ navigation }) {
  const openEmail = () => {
    Linking.openURL("mailto:creator@example.com");
  };

  const openWebsite = () => {
    Linking.openURL("https://example.com");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About the Creator</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarWrap}>
          <Image source={require('../assets/coleen.jpg')} style={{ width: 120, height: 120, borderRadius: 60 }} />
        </View>

        <Text style={styles.name}>Coleen Kieth Gonzales</Text>
        <Text style={styles.role}>Mobile Developer & Designer</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.description}>
            Coleen is the lead developer behind CampusBuzz — focused on creating
            accessible mobile experiences for campus communities. This app was built
            as a lightweight platform for announcements, events and news.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact</Text>
          <TouchableOpacity style={styles.contactRow} onPress={openEmail}>
            <Ionicons name="mail-outline" size={20} color="#7C3AED" />
            <Text style={styles.contactText}>coleengwapa@gmail.com</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactRow} onPress={openWebsite}>
            <Ionicons name="globe-outline" size={20} color="#7C3AED" />
            <Text style={styles.contactText}>https://campusbuzz.com</Text>
          </TouchableOpacity>
        </View>


        {/* Team Grid (3 x 3) */}
        <View style={styles.teamSection}>
          <Text style={styles.sectionTitle}>Team</Text>
          <View style={styles.teamGrid}>
            {[
              { name: 'Ma.Rogelyn', role: 'Sapong', avatar: require('../assets/oge.jpg') },
              { name: 'Nelcris', role: 'Asoro', avatar: require('../assets/nelcris.jpg') },
              { name: 'Miko', role: 'Ore', avatar: require('../assets/miko.jpeg') },
              { name: 'Marilyn', role: 'Salaum', avatar: require('../assets/mar.jpeg') },
              { name: 'Judith', role: 'Butlig', avatar: require('../assets/judith.png') },
              { name: 'Jefferson', role: 'Busano', avatar: require('../assets/jeff.jpg') },
              { name: 'Ailyn', role: 'Albaran', avatar: require('../assets/ailyn.png') },
              { name: 'Ailyn', role: 'Namuag', avatar: require('../assets/ilyn.jpeg') },
              { name: 'Alvin', role: 'Alba', avatar: require('../assets/alvin.jpg') },
            ].map((member, idx) => (
              <TouchableOpacity key={idx} style={styles.memberCard}>
                <Image source={member.avatar} style={styles.memberAvatar} />
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#fff" },
  backBtn: { marginRight: 8, marginTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  content: { padding: 20, alignItems: "center" },
  avatarWrap: { marginTop: 10, marginBottom: 12 },
  name: { fontSize: 22, fontWeight: "800", color: "#0F172A", marginTop: 6 },
  role: { fontSize: 14, color: "#64748B", marginBottom: 16 },
  card: { width: "100%", backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#7C3AED", marginBottom: 8 },
  description: { fontSize: 14, color: "#475569", lineHeight: 20 },
  contactRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  contactText: { marginLeft: 12, color: "#0F172A", fontWeight: "600" },
  headPanel: { width: '100%', flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 14, alignItems: 'center', elevation: 2 },
  headImage: { width: 86, height: 86, borderRadius: 46 },
  headInfo: { flex: 1, marginLeft: 12 },
  headName: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  headTitle: { fontSize: 13, color: '#64748B', marginTop: 2, marginBottom: 6 },
  headBio: { fontSize: 13, color: '#475569', lineHeight: 18 },
  teamSection: { width: '100%', marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#7C3AED', marginBottom: 10 },
  teamGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  memberCard: { width: '30%', backgroundColor: '#fff', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', marginBottom: 12, elevation: 2 },
  memberAvatar: { width: 64, height: 64, borderRadius: 32 },
  memberName: { marginTop: 8, fontSize: 13, fontWeight: '700', color: '#0F172A' },
  memberRole: { fontSize: 12, color: '#64748B' },
});
