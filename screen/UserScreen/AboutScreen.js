import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function AboutScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Logo and App Name */}
        <View style={styles.logoSection}>
          <View style={styles.logoBackground}>
            <Ionicons name="newspaper" size={80} color="#fff" />
          </View>
          <Text style={styles.appName}>Campus News</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        {/* Description Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About Our App</Text>
          <Text style={styles.description}>
            Campus News is an innovative mobile application designed to keep the
            students, faculty, and staff of Trinidad Municipal College informed
            and connected. The app provides real-time updates on the latest news,
            events, announcements, and activities happening within the campus
            community.
          </Text>
        </View>

        {/* Features Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why Campus News?</Text>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>
              Centralized information in one accessible platform
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>
              Stay engaged with real-time updates
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>
              Customize notifications by your interests
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>
              Simple, user-friendly interface
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>
              Foster communication and community
            </Text>
          </View>
        </View>

        {/* Mission Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Mission</Text>
          <Text style={styles.description}>
            Campus News is more than just an app—it is a digital hub for campus
            life, promoting awareness, involvement, and collaboration among
            everyone on campus. By centralizing information, we make it easier
            for users to stay engaged, plan their schedules, and participate in
            campus life.
          </Text>
        </View>

        {/* Contact Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Get in Touch</Text>
          <TouchableOpacity style={styles.contactRow}>
            <Ionicons name="mail-outline" size={20} color="#7C3AED" />
            <Text style={styles.contactText}>support@campusnews.com</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactRow}>
            <Ionicons name="phone-portrait-outline" size={20} color="#7C3AED" />
            <Text style={styles.contactText}>+1 (555) 123-4567</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactRow}>
            <Ionicons name="location-outline" size={20} color="#7C3AED" />
            <Text style={styles.contactText}>
              Trinidad Municipal College
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Campus News. All rights reserved.
          </Text>
          <Text style={styles.footerSubtext}>
            Enhancing Campus Community Connection
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  backButton: { padding: 6, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  content: { flex: 1, paddingHorizontal: 16 },
  logoSection: {
    alignItems: "center",
    marginVertical: 30,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: "#64748B",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7C3AED",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#475569",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  contactText: {
    fontSize: 14,
    color: "#0F172A",
    marginLeft: 12,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  footerSubtext: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
    textAlign: "center",
  },
  spacer: { height: 20 },
});
