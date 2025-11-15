import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register device for push notifications
 * Requests user permission and gets push token
 */
export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Must use physical device for push notifications');
    return;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Only ask if permission was not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return;
    }

    // Get push token
    const projectId = Constants.expoConfig?.extra?.projectId || Constants.projectId;
    if (!projectId) {
      throw new Error('Project ID not found');
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Push notification token:', token);
    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
  }
}

/**
 * Set up notification listeners for foreground and background notifications
 * Returns an unsubscribe function to clean up listeners
 */
export function setupNotificationListeners() {
  // Listen to notifications when app is in foreground
  const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received in foreground:', notification);
  });

  // Listen to notification responses (when user taps on notification)
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification response received:', response);
    // Handle navigation or other actions based on notification data
  });

  // Return cleanup function
  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

/**
 * Send local notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional notification data
 */
export async function sendLocalNotification(title, body, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        badge: 1,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
}

/**
 * Send scheduled notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {number} seconds - Seconds until notification should be sent
 * @param {object} data - Additional notification data
 */
export async function sendScheduledNotification(title, body, seconds = 5, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: {
        seconds,
      },
    });
  } catch (error) {
    console.error('Error sending scheduled notification:', error);
  }
}
