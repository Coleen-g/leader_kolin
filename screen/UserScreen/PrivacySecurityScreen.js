import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Switch,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../../firebase/firebaseConfig';
import { deleteUser, signOut } from 'firebase/auth';

export default function PrivacySecurityScreen({ navigation }) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [profilePrivate, setProfilePrivate] = useState(false);
  const [dataCollection, setDataCollection] = useState(true);

  const navigateToProfileTab = () => {
    try {
      let nav = navigation;
      while (nav) {
        const state = nav.getState && nav.getState();
        if (state && Array.isArray(state.routeNames) && state.routeNames.includes('Home')) {
          nav.navigate('Home', { screen: 'ProfileTab' });
          return;
        }
        nav = nav.getParent && nav.getParent();
      }
    } catch (e) {
      // fallback
      try { navigation.navigate('SettingsMain'); } catch (err) {}
    }
  };

  const handleChangePassword = () => {
    if (!auth.currentUser || !auth.currentUser.email) {
      Alert.alert('Error', 'Unable to send password reset email');
      return;
    }
    auth.sendPasswordResetEmail(auth.currentUser.email)
      .then(() => {
        Alert.alert('Success', 'Password reset email sent to ' + auth.currentUser.email);
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteUser(auth.currentUser);
              Alert.alert('Success', 'Your account has been deleted.');
              await signOut(auth);
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const SettingRow = ({ icon, label, description, rightContent }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <MaterialCommunityIcons name={icon} size={20} color="#667EEA" />
        <View style={styles.settingTextContainer}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>
      {rightContent}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.headerTop,
          { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 12 },
        ]}
      >
        <TouchableOpacity onPress={navigateToProfileTab} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#667EEA" />
            <Text style={styles.sectionTitle}>Security</Text>
          </View>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={handleChangePassword}
            >
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="lock-reset" size={20} color="#667EEA" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.label}>Change Password</Text>
                  <Text style={styles.description}>Update your password</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <View style={styles.switchRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="shield-lock" size={20} color="#667EEA" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.label}>Two-Factor Authentication</Text>
                  <Text style={styles.description}>Add extra security to your account</Text>
                </View>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
                trackColor={{ false: '#E2E8F0', true: '#667EEA' }}
                thumbColor={twoFactorEnabled ? '#fff' : '#94A3B8'}
              />
            </View>
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye-outline" size={20} color="#667EEA" />
            <Text style={styles.sectionTitle}>Privacy</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="account-lock-outline" size={20} color="#667EEA" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.label}>Private Profile</Text>
                  <Text style={styles.description}>Only approved users can see your profile</Text>
                </View>
              </View>
              <Switch
                value={profilePrivate}
                onValueChange={setProfilePrivate}
                trackColor={{ false: '#E2E8F0', true: '#667EEA' }}
                thumbColor={profilePrivate ? '#fff' : '#94A3B8'}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.switchRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="database-outline" size={20} color="#667EEA" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.label}>Data Collection</Text>
                  <Text style={styles.description}>Allow collection of usage analytics</Text>
                </View>
              </View>
              <Switch
                value={dataCollection}
                onValueChange={setDataCollection}
                trackColor={{ false: '#E2E8F0', true: '#667EEA' }}
                thumbColor={dataCollection ? '#fff' : '#94A3B8'}
              />
            </View>
          </View>
        </View>

        {/* End of main content - simplified view */}
        <View style={{ height: 24 }} />
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
  label: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  description: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginHorizontal: 16 },
  spacer: { height: 20 },
});
