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

import DashboardScreen from "../screen/EditorScreen/EditorDashboardScreen";
import ManageNewsScreen from "../screen/EditorScreen/ManageArticlesScreen";
import SettingsScreen from "../screen/EditorScreen/EditorSettingsScreen";
import CreateNewsScreen from "../screen/EditorScreen/CreateNewsScreen";
import EditorProfileScreen from "../screen/EditorScreen/EditorProfileScreen";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// ✅ Custom Drawer Sidebar (below system time)
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

function DrawerScreens() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#1E293B" },
        headerTintColor: "#fff",
        drawerActiveBackgroundColor: "#3B82F6",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#333",
        drawerLabelStyle: { fontSize: 15 },
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
        name="Profile"
        component={EditorProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
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

export default function EditorDrawerNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Editor"
        component={DrawerScreens}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateNews"
        component={CreateNewsScreen}
        options={{
          title: "Create News",
          headerStyle: { backgroundColor: "#1E293B" },
          headerTintColor: "#fff",
        }}
      />
    </Stack.Navigator>
  );
}