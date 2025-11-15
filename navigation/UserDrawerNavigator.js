import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  StyleSheet,
} from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// 📱 Import Screens
import UserHomeScreen from "../screen/UserScreen/UserHomeScreen"; // Home tab
import UserNewsScreen from "../screen/UserScreen/UserNewsScreen"; // News tab
import UserSettingsScreen from "../screen/UserScreen/UserSettingsScreen";
import AboutScreen from "../screen/UserScreen/AboutScreen"; // About screen
import HelpScreen from "../screen/UserScreen/HelpScreen";
import UserProfileScreen from "../screen/UserScreen/UserProfileScreen";
import FavoritesScreen from "../screen/UserScreen/FavoritesScreen"; // Favorites tab
import NewsDetailScreen from "../screen/UserScreen/NewsDetailScreen"; // News detail
import EventDetailScreen from "../screen/UserScreen/EventDetailScreen"; // Event detail (user version)

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ✅ News Stack Navigator (for News + NewsDetail)
function NewsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="UserNewsList"
        component={UserNewsScreen}
      />
      <Stack.Screen
        name="NewsDetail"
        component={NewsDetailScreen}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
      />
    </Stack.Navigator>
  );
}

// ✅ Favorites Stack Navigator (for Favorites + NewsDetail)
function FavoritesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="FavoritesList"
        component={FavoritesScreen}
      />
      <Stack.Screen
        name="NewsDetailFromFav"
        component={NewsDetailScreen}
      />
    </Stack.Navigator>
  );
}

// ✅ Settings Stack Navigator (for Settings + About)
function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={UserSettingsScreen}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerStyle: { backgroundColor: '#7C3AED' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700', fontSize: 20 },
          title: 'About Campus News',
          headerLeft: () => (
            <TouchableOpacity 
              style={{ marginLeft: 14, padding: 8 }}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
}

// ✅ Bottom Tabs Navigator
function UserBottomTabs() {
  const [userAvatar, setUserAvatar] = useState('https://i.pravatar.cc/100');

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.photoURL) {
          setUserAvatar(currentUser.photoURL);
        }
      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    };

    fetchAvatar();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: '#fff' },
        headerTitleAlign: 'center',
        headerTitle: () => (
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <MaterialCommunityIcons name="school" size={26} color="#7C3AED" />
          </TouchableOpacity>
        ),
        headerLeft: () => (
          <TouchableOpacity style={{ marginLeft: 14 }} onPress={() => navigation.getParent()?.openDrawer()}>
            <Image
              source={{ uri: userAvatar }}
              style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#E6EEF8' }}
            />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity style={{ marginRight: 14 }} onPress={() => navigation.getParent()?.navigate('Settings')}>
            <Ionicons name="settings-outline" size={22} color="#1E293B" />
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 65,
          elevation: 8,
        },
        tabBarActiveTintColor: '#0055FF',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginBottom: 5 },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={UserHomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={28} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="NewsTab"
        component={NewsStack}
        options={{
          title: 'News',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={28} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesStack}
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={28} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={UserProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={28} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ✅ Custom Drawer Sidebar
function CustomDrawerContent(props) {
  const { navigation } = props;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUser({
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'User',
              username: userDoc.data().username || '@user',
              email: currentUser.email,
              photoURL: currentUser.photoURL || 'https://i.pravatar.cc/100',
              following: userDoc.data().following || 0,
              followers: userDoc.data().followers || 0,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        paddingTop: 0,
      }}
    >
      {/* Profile Header */}
      {user ? (
        <View style={styles.profileHeader}>
          <View style={styles.profileTop}>
            <Image
              source={{ uri: user.photoURL }}
              style={styles.profileAvatar}
            />
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="ellipsis-vertical" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{user.displayName}</Text>
          <Text style={styles.profileUsername}>{user.username}</Text>
          <View style={styles.divider} />
        </View>
      ) : null}

      {/* Drawer Items */}
      <DrawerItemList {...props} />

      {/* 🚪 Logout Button */}
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.replace("Login")}
        >
          <Ionicons name="log-out-outline" size={22} color="#fff" />
          <Text style={{ color: "#fff", marginLeft: 8, fontWeight: "bold" }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

// ✅ Drawer Navigator
export default function UserDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
        drawerStyle: {
          marginTop: 30,
          width: 260,
          backgroundColor: "#F9FAFB",
          paddingVertical: 20,
        },
        overlayColor: "rgba(0,0,0,0.2)",
        headerStyle: { backgroundColor: "#0055FF" },
        headerTintColor: "#fff",
        drawerActiveTintColor: "#0055FF",
        drawerInactiveTintColor: "#555",
        drawerLabelStyle: { fontSize: 16, fontWeight: "500" },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={UserBottomTabs}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={26} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={26} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Help"
        component={HelpScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={26} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  profileHeader: { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  profileTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  profileAvatar: { width: 60, height: 60, borderRadius: 30 },
  settingsButton: { padding: 8 },
  profileName: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  profileUsername: { fontSize: 13, color: '#64748B', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#E2E8F0' },
  logoutButton: { backgroundColor: '#EF4444', padding: 15, margin: 20, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }
});