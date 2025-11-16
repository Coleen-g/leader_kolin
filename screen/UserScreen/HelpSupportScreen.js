import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  TextInput,
  StatusBar,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HelpSupportScreen({ navigation }) {
  const [expanded, setExpanded] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    {
      id: 1,
      question: 'How do I create an account?',
      answer: 'Go to the Register screen, enter your username, email, and password. Your account will be created and you can log in immediately.'
    },
    {
      id: 2,
      question: 'How do I bookmark articles?',
      answer: 'While viewing an article, tap the bookmark icon to save it. Your bookmarks will be available in the Favorites tab.'
    },
    {
      id: 3,
      question: 'How do I change my password?',
      answer: 'Go to Settings > Privacy & Security > Change Password. You\'ll receive an email with instructions to reset your password.'
    },
    {
      id: 4,
      question: 'Can I customize my news categories?',
      answer: 'Yes! In Settings > News Categories, select the categories you\'re interested in. Your feed will be customized based on your preferences.'
    },
    {
      id: 5,
      question: 'How do I report inappropriate content?',
      answer: 'If you find inappropriate content, tap the report button on the article. Our team will review it within 24 hours.'
    },
    {
      id: 6,
      question: 'How do I delete my account?',
      answer: 'Go to Settings > Privacy & Security > Delete Account. Please note that this action cannot be undone and all your data will be permanently deleted.'
    },
  ];

  const handleSubmitSupport = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate sending email
      setTimeout(() => {
        Alert.alert('Success', 'Your message has been sent to our support team. We\'ll get back to you soon!');
        setName('');
        setEmail('');
        setMessage('');
        setSubmitting(false);
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setSubmitting(false);
    }
  };

  const toggleFAQ = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleContactEmail = () => {
    Linking.openURL('mailto:support@campusnews.edu?subject=Campus News App Support');
  };

  const handleContactPhone = () => {
    Linking.openURL('tel:+15551234567');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.headerTop,
          { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 12 },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Quick Contact */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call" size={20} color="#667EEA" />
            <Text style={styles.sectionTitle}>Quick Contact</Text>
          </View>
          <View style={styles.contactContainer}>
            <TouchableOpacity style={styles.contactCard} onPress={handleContactEmail}>
              <View style={[styles.contactIcon, { backgroundColor: '#667EEA' }]}>
                <MaterialCommunityIcons name="email-outline" size={24} color="#fff" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email Support</Text>
                <Text style={styles.contactValue}>support@campusnews.edu</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={handleContactPhone}>
              <View style={[styles.contactIcon, { backgroundColor: '#10B981' }]}>
                <MaterialCommunityIcons name="phone-outline" size={24} color="#fff" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Call Us</Text>
                <Text style={styles.contactValue}>+1 (555) 123-4567</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={20} color="#667EEA" />
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>
          <View style={styles.card}>
            {faqs.map((faq, index) => (
              <View key={faq.id}>
                <TouchableOpacity
                  style={styles.faqItem}
                  onPress={() => toggleFAQ(faq.id)}
                >
                  <View style={styles.faqLeft}>
                    <MaterialCommunityIcons
                      name={expanded === faq.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#667EEA"
                    />
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                  </View>
                </TouchableOpacity>
                {expanded === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
                {index < faqs.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail" size={20} color="#667EEA" />
            <Text style={styles.sectionTitle}>Send Us a Message</Text>
          </View>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
              editable={!submitting}
            />
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              placeholder="Your Email"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!submitting}
            />
            <View style={styles.divider} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Your Message"
              placeholderTextColor="#94A3B8"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              editable={!submitting}
            />
            <TouchableOpacity
              style={[styles.submitButton, submitting && { opacity: 0.7 }]}
              onPress={handleSubmitSupport}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="send-outline" size={18} color="#fff" />
                  <Text style={styles.submitButtonText}>Send Message</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book" size={20} color="#667EEA" />
            <Text style={styles.sectionTitle}>Resources</Text>
          </View>
          <View style={styles.card}>
            <TouchableOpacity style={styles.resourceItem}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color="#667EEA" />
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceLabel}>User Guide</Text>
                <Text style={styles.resourceDesc}>Learn how to use the app</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.resourceItem}>
              <MaterialCommunityIcons name="bug-outline" size={20} color="#667EEA" />
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceLabel}>Report a Bug</Text>
                <Text style={styles.resourceDesc}>Help us improve the app</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.resourceItem}>
              <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#667EEA" />
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceLabel}>Feature Requests</Text>
                <Text style={styles.resourceDesc}>Suggest new features</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#667EEA" />
            <View>
              <Text style={styles.infoTitle}>Campus News App</Text>
              <Text style={styles.infoText}>Version 1.0.0</Text>
              <Text style={styles.infoText}>© 2024 Campus News Team. All rights reserved.</Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  backButton: { padding: 6, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A', flex: 1 },
  section: { marginBottom: 20, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginLeft: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2 },

  // Contact
  contactContainer: { gap: 12 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    elevation: 2,
  },
  contactIcon: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  contactInfo: { flex: 1 },
  contactLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  contactValue: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

  // FAQ
  faqItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  faqLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  faqQuestion: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginLeft: 10 },
  faqAnswer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F8FAFC' },
  faqAnswerText: { fontSize: 13, color: '#64748B', lineHeight: 20 },

  // Form
  input: { paddingVertical: 12, paddingHorizontal: 16, fontSize: 14, color: '#0F172A' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667EEA',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Resources
  resourceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  resourceInfo: { flex: 1, marginLeft: 12 },
  resourceLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  resourceDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

  // Info Box
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginLeft: 12, marginBottom: 4 },
  infoText: { fontSize: 12, color: '#94A3B8', marginLeft: 12 },

  divider: { height: 1, backgroundColor: '#E2E8F0' },
  spacer: { height: 20 },
});
