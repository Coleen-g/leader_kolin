import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function UserSettingsScreen({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categories = ['Sports', 'Technology', 'Science', 'Business', 'Entertainment', 'Health', 'Politics'];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser({
            name: userDoc.data().displayName || currentUser.displayName || '',
            email: currentUser.email,
            uid: currentUser.uid,
            preferences: userDoc.data().preferences || {},
          });
          setSelectedCategories(userDoc.data().preferences?.categories || []);
        } else {
          setUser({
            name: currentUser.displayName || '',
            email: currentUser.email,
            uid: currentUser.uid,
          });
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const savePreferences = async () => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        preferences: {
          categories: selectedCategories,
          darkMode,
        }
      });
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
      console.error('Error saving preferences:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.headerTop,
          { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 12 },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Home')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* User Profile Card */}
        <LinearGradient colors={['#7C3AED', '#6D28D9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <MaterialCommunityIcons name="account-circle" size={60} color="#fff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* News Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="newspaper" size={20} color="#7C3AED" />
            <Text style={styles.sectionTitle}>News Categories</Text>
          </View>
          <View style={styles.card}>
            {categories.map((category, index) => (
              <View key={category}>
                <TouchableOpacity
                  style={styles.categoryRow}
                  onPress={() => toggleCategory(category)}
                >
                  <View style={styles.checkboxContainer}>
                    <View
                      style={[
                        styles.checkbox,
                        selectedCategories.includes(category) && styles.checkboxActive,
                      ]}
                    >
                      {selectedCategories.includes(category) && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                  </View>
                  <Text style={styles.categoryText}>{category}</Text>
                </TouchableOpacity>
                {index < categories.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="palette" size={20} color="#7C3AED" />
            <Text style={styles.sectionTitle}>Appearance</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="moon-waning-crescent" size={20} color="#7C3AED" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.label}>Dark Mode</Text>
                  <Text style={styles.description}>Coming soon</Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                disabled={true}
                trackColor={{ false: '#E2E8F0', true: '#7C3AED' }}
                thumbColor="#94A3B8"
              />
            </View>
          </View>
        </View>

        {/* Quick Links Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="link" size={20} color="#7C3AED" />
            <Text style={styles.sectionTitle}>More</Text>
          </View>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigation.navigate('PrivacySecurity')}
            >
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="shield-check-outline" size={20} color="#7C3AED" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.label}>Privacy & Security</Text>
                  <Text style={styles.description}>Manage your privacy settings</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="help-circle-outline" size={20} color="#7C3AED" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.label}>Help & Support</Text>
                  <Text style={styles.description}>Get help and support</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="tag-outline" size={20} color="#7C3AED" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.label}>App Version</Text>
                  <Text style={styles.description}>1.0.0</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={savePreferences}>
          <LinearGradient colors={['#7C3AED', '#6D28D9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGradient}>
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          </LinearGradient>
        </TouchableOpacity>

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
  
  /* Profile Card */
  profileCard: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  profileAvatar: { marginRight: 16 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  profileEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  /* Section Header */
  section: { marginBottom: 20, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginLeft: 8 },
  
  /* Cards */
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2 },
  
  /* Setting Rows */
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingTextContainer: { marginLeft: 12, flex: 1 },
  
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  
  /* Category Row */
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  checkboxContainer: { marginRight: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  checkboxActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  categoryText: { fontSize: 15, fontWeight: '600', color: '#0F172A', flex: 1 },
  
  /* Labels and Text */
  label: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  description: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  
  /* Divider */
  divider: { height: 1, backgroundColor: '#E2E8F0' },
  
  /* Button */
  saveButton: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    marginBottom: 16,
  },
  buttonGradient: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  spacer: { height: 20 },
});
