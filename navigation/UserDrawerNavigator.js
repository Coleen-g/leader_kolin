import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// 📱 Import Screens
import UserHomeScreen from "../screen/UserScreen/UserHomeScreen"; // Home tab
import UserNewsScreen from "../screen/UserScreen/UserNewsScreen"; // News tab
import UserSettingsScreen from "../screen/UserScreen/UserSettingsScreen";
import HelpScreen from "../screen/UserScreen/HelpScreen";
import UserProfileScreen from "../screen/UserScreen/UserProfileScreen";

// Placeholder for Notifications (optional)
function NotificationsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, fontWeight: "500" }}>Notifications</Text>
    </View>
  );
}

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

// ✅ Bottom Tabs Navigator
function UserBottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          borderRadius: 20,
          elevation: 8,
          height: 65,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: 5 },
          shadowRadius: 10,
        },
        tabBarActiveTintColor: "#0055FF",
        tabBarInactiveTintColor: "#888",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600", marginBottom: 5 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={UserHomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={28} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="News"
        component={UserNewsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={28} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={UserProfileScreen}
        options={{
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

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        paddingTop:
          Platform.OS === "android" ? StatusBar.currentHeight + 10 : 40,
      }}
    >
      {/* Drawer Items */}
      <DrawerItemList {...props} />

      {/* 🚪 Logout Button */}
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#EF4444",
            padding: 15,
            margin: 20,
            borderRadius: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
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
        headerShown: true,
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
        component={UserSettingsScreen}
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