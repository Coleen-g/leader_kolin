import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Switch } from 'react-native-paper';

export default function SettingsScreen() {
  const [allowComments, setAllowComments] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">⚙️ App Settings</Text>

      <View style={styles.row}>
        <Text>Allow Comments</Text>
        <Switch value={allowComments} onValueChange={setAllowComments} />
      </View>

      <View style={styles.row}>
        <Text>Show Notifications</Text>
        <Switch value={notifications} onValueChange={setNotifications} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
});