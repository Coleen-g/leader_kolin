import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
} from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import DashboardScreen from "../screen/EditorScreen/EditorDashboardScreen";
import ManageNewsScreen from "../screen/EditorScreen/ManageArticlesScreen";
import SettingsScreen from "../screen/EditorScreen/EditorSettingsScreen";
import CreateNewsScreen from "../screen/EditorScreen/CreateNewsScreen";
import EditorProfileScreen from "../screen/EditorScreen/EditorProfileScreen";
import EditEditorProfileScreen from "../screen/EditorScreen/EditEditorProfileScreen";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ Custom Gradient Header Component
function GradientHeader({ navigation, title }) {
  return (
    <LinearGradient
      colors={["#667EEA", "#7C3AED", "#6D28D9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingHorizontal: 18,
        paddingVertical: 28,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 14,
          }}
        >
          <MaterialCommunityIcons name="school" size={30} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>CampusBuzz</Text>
          <Text style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 12, fontWeight: "500", marginTop: 2 }}>{title}</Text>
        </View>
      </View>
      <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 13, fontWeight: "500", marginTop: 12 }}>
        Manage and publish campus stories
      </Text>
    </LinearGradient>
  );
}

// ✅ Custom Drawer Sidebar (below system time)
function CustomDrawerContent(props) {
  const { navigation } = props;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        paddingTop: 0,
      }}
    >
      {/* Gradient Header with Logo */}
      <LinearGradient
        colors={["#667EEA", "#7C3AED", "#6D28D9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 18,
          paddingVertical: 28,
          alignItems: "flex-start",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: "rgba(255, 255, 255, 0.25)",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 14,
            }}
          >
            <MaterialCommunityIcons name="school" size={30} color="#fff" />
          </View>
          <View>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>CampusBuzz</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Drawer Items */}
      <DrawerItemList {...props} />

      {/* 🚪 Logout Button */}
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#EF4444",
            padding: 14,
            marginHorizontal: 16,
            marginBottom: 24,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => navigation.replace("Login")}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={{ color: "#fff", marginLeft: 8, fontWeight: "700", fontSize: 15 }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

function DrawerScreens({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ navigation: tabNavigation }) => ({
        headerShown: true,
        header: () => <GradientHeader navigation={navigation} title="Editor Dashboard" />,
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 65,
          elevation: 8,
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
        },
        tabBarActiveTintColor: '#667EEA',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginBottom: 5 },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ManageTab"
        component={ManageNewsScreen}
        options={{
          title: 'Manage',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="newspaper-variant-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="CreateTab"
        component={CreateNewsScreen}
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#667EEA',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -8,
                elevation: 5,
              }}
            >
              <MaterialCommunityIcons name="plus" size={32} color="#fff" />
            </View>
          ),
          tabBarLabel: '',
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={EditorProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function EditorDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
        drawerStyle: {
          marginTop: 0,
          width: 260,
          backgroundColor: "#FAFBFC",
          paddingVertical: 0,
        },
        overlayColor: "rgba(0,0,0,0.2)",
        drawerActiveBackgroundColor: "#EEE8FF",
        drawerActiveTintColor: "#667EEA",
        drawerInactiveTintColor: "#64748B",
        drawerLabelStyle: { fontSize: 14, fontWeight: "600" },
      }}
    >
      <Drawer.Screen
        name="Editor"
        children={(props) => <DrawerScreens {...props} navigation={props.navigation} />}
        options={{
          drawerLabel: "Home",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="EditEditorProfile"
        component={EditEditorProfileScreen}
        options={{
          drawerItemStyle: { display: 'none' },
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
}