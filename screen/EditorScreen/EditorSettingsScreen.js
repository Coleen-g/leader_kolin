import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text, Switch, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../../firebase/firebaseConfig';

export default function EditorSettingsScreen() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Profile Settings
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Content Settings
  const [defaultCategory, setDefaultCategory] = useState('General');
  const [autoSaveDraft, setAutoSaveDraft] = useState(true);

  // Media Settings
  const [imageQuality, setImageQuality] = useState('High');

  // Notifications
  const [notifyApproval, setNotifyApproval] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);

  // App Preferences
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);
      setName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, []);

  const handleChangePassword = () => {
    if (!currentUser || !email) {
      Alert.alert('Error', 'Unable to send password reset email');
      return;
    }
    setLoading(true);
    auth.sendPasswordResetEmail(email)
      .then(() => {
        Alert.alert('Success', 'Password reset email sent to ' + email);
        setLoading(false);
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
        setLoading(false);
      });
  };

  const SettingSection = ({ title, icon, color, children }) => (
    <View style={[styles.sectionCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: color + '22' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const SettingRow = ({ label, children, rightContent }) => (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      {children || rightContent}
    </View>
  );

  const DropdownButton = ({ value, options, onSelect }) => (
    <TouchableOpacity
      style={styles.dropdown}
      onPress={() => {
        Alert.alert('Select Option', '', [
          ...options.map((opt) => ({
            text: opt,
            onPress: () => onSelect(opt),
          })),
          { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        ]);
      }}
    >
      <Text style={styles.dropdownText}>{value}</Text>
      <MaterialCommunityIcons name="chevron-down" size={20} color="#667EEA" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="cog-outline" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.header}>Settings</Text>
            <Text style={styles.subHeader}>Manage your preferences</Text>
          </View>
        </View>
      </View>

      {/* 1. Profile Settings */}
      <SettingSection title="Profile Settings" icon="account-circle-outline" color="#667EEA">
        <SettingRow label="Full Name">
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            editable={false}
          />
        </SettingRow>
        <SettingRow label="Email">
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            editable={false}
          />
        </SettingRow>
        <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="lock-reset" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Change Password</Text>
            </>
          )}
        </TouchableOpacity>
      </SettingSection>

      {/* 2. Content Settings */}
      <SettingSection title="Content Settings" icon="newspaper-variant-outline" color="#10B981">
        <SettingRow label="Default News Category">
          <DropdownButton
            value={defaultCategory}
            options={['General', 'Events', 'Sports', 'Announcements', 'Technology']}
            onSelect={setDefaultCategory}
          />
        </SettingRow>
        <SettingRow
          label="Auto-Save Draft"
          rightContent={
            <Switch value={autoSaveDraft} onValueChange={setAutoSaveDraft} color="#10B981" />
          }
        />
      </SettingSection>

      {/* 3. Media Settings */}
      <SettingSection title="Media Settings" icon="image-outline" color="#F59E0B">
        <SettingRow label="Image Upload Quality">
          <DropdownButton
            value={imageQuality}
            options={['High', 'Medium', 'Low']}
            onSelect={setImageQuality}
          />
        </SettingRow>
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information-outline" size={18} color="#F59E0B" />
          <Text style={styles.infoText}>Allowed image types: JPG, PNG</Text>
        </View>
      </SettingSection>

      {/* 4. Notifications */}
      <SettingSection title="Notifications" icon="bell-outline" color="#EF4444">
        <SettingRow
          label="Notify when news is approved"
          rightContent={
            <Switch value={notifyApproval} onValueChange={setNotifyApproval} color="#EF4444" />
          }
        />
        <SettingRow
          label="Notify when someone comments"
          rightContent={
            <Switch value={notifyComments} onValueChange={setNotifyComments} color="#EF4444" />
          }
        />
      </SettingSection>

      {/* 5. App Preferences */}
      <SettingSection title="App Preferences" icon="palette-outline" color="#8B5CF6">
        <SettingRow
          label="Dark Mode"
          rightContent={<Switch value={darkMode} onValueChange={setDarkMode} color="#8B5CF6" />}
        />
      </SettingSection>

      {/* 6. About App */}
      <SettingSection title="About App" icon="information-outline" color="#06B6D4">
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>App Name</Text>
          <Text style={styles.aboutValue}>Campus News App</Text>
        </View>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Developed By</Text>
          <Text style={styles.aboutValue}>Campus News Team</Text>
        </View>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Purpose</Text>
          <Text style={styles.aboutValue}>
            This app allows students and editors to publish and read campus news, announcements, and events.
          </Text>
        </View>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Contact Email</Text>
          <Text style={[styles.aboutValue, { color: '#667EEA' }]}>support@campusnews.edu</Text>
        </View>
      </SettingSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F5FF',
    paddingHorizontal: 12,
  },
  headerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  subHeader: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionContent: {
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#0F172A',
    width: 200,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 120,
  },
  dropdownText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667EEA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginTop: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },
  aboutItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  aboutLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  aboutValue: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
  },
});