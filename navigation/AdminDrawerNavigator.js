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
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

import DashboardScreen from "../screen/AdminScreen/DashboardScreen";
import CategoriesScreen from "../screen/AdminScreen/CategoriesScreen";
import ManageNewsScreen from "../screen/AdminScreen/ManageNewsScreen";
import NewsDetailScreen from "../screen/AdminScreen/NewsDetailScreen";
import ManageUsersScreen from "../screen/AdminScreen/ManageUsersScreen";
import AddUserScreen from "../screen/AdminScreen/AddUserScreen";
import EditUserScreen from "../screen/AdminScreen/EditUserScreen";
import SettingsScreen from "../screen/AdminScreen/SettingsScreen";
import CreateNewsScreen from "../screen/AdminScreen/CreateNewsScreen";
import EventDetailScreen from "../screen/AdminScreen/EventDetailScreen";
import AddEventScreen from "../screen/AdminScreen/AddEventScreen";
import EventAttendeesScreen from "../screen/AdminScreen/EventAttendeesScreen";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// ✅ Custom Drawer Sidebar Content (below system status bar)
function CustomDrawerContent(props) {
  const { navigation } = props;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        paddingTop:
          Platform.OS === "android" ? StatusBar.currentHeight + 10 : 40, // ensures padding below system time
      }}
    >
      {/* Drawer Header */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center' }}>
            <MaterialCommunityIcons name="newspaper-variant-multiple-outline" size={20} color="#fff" />
          </View>
          <View>
            <Text style={{ color: '#0F172A', fontWeight: '800', fontSize: 18 }}>Campus News</Text>
            <Text style={{ color: '#64748B', fontSize: 12 }}>Admin Panel</Text>
          </View>
        </View>
      </View>
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

// ✅ Drawer Screens with Fixed Sidebar
function DrawerScreens() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#667EEA" },
        headerTintColor: "#fff",
        drawerStyle: { backgroundColor: '#F8FAFF', width: 260 },
        drawerActiveBackgroundColor: "#7C3AED",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#334155",
        drawerLabelStyle: { fontSize: 15, fontWeight: '700' },
        sceneContainerStyle: { backgroundColor: '#F0F5FF' },
        itemStyle: { marginVertical: 4 },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="speedometer-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="shape-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Manage News"
        component={ManageNewsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="newspaper-variant-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Manage Users"
        component={ManageUsersScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// ✅ Stack Screens Stay Same
export default function AdminDrawerNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Admin"
        component={DrawerScreens}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateNews"
        component={CreateNewsScreen}
        options={{
          title: "Create News",
          headerStyle: { backgroundColor: "#667EEA" },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="NewsDetail"
        component={NewsDetailScreen}
        options={{
          title: "News Details",
          headerStyle: { backgroundColor: "#667EEA" },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="AddEvent"
        component={AddEventScreen}
        options={{
          title: "Add Event",
          headerStyle: { backgroundColor: "#667EEA" },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{
          title: "Event Details",
          headerStyle: { backgroundColor: "#667EEA" },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="EventAttendees"
        component={EventAttendeesScreen}
        options={{
          title: "Event Attendees",
          headerStyle: { backgroundColor: "#667EEA" },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="AddUser"
        component={AddUserScreen}
        options={{
          title: "Add User",
          headerStyle: { backgroundColor: "#667EEA" },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="EditUser"
        component={EditUserScreen}
        options={{
          title: "Edit User",
          headerStyle: { backgroundColor: "#667EEA" },
          headerTintColor: "#fff",
        }}
      />
    </Stack.Navigator>
  );
}