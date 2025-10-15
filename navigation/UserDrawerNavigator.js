import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  SafeAreaView,
  TouchableOpacity,
  Text,
  View,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";

import UserHomeScreen from "../screen/UserScreen/UserHomeScreen";
import UserProfileScreen from "../screen/UserScreen/UserProfileScreen";
import UserSettingsScreen from "../screen/UserScreen/UserSettingsScreen";
import HelpScreen from "../screen/UserScreen/HelpScreen";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/* -------------------------------------------------------------------------- */
/* 🔹 PROFESSIONAL UI FOR UserNewsScreen */
/* -------------------------------------------------------------------------- */
function UserNewsScreen() {
  const newsData = [
    {
      id: "1",
      title: "Campus Election Results Announced",
      description:
        "Trinidad Municipal College announced the winners of the recent student elections.",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=60",
      date: "October 10, 2025",
    },
    {
      id: "2",
      title: "New Library Opens at TMC",
      description:
        "The new digital library features modern reading pods and a tech hub for students.",
      image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60",
      date: "October 8, 2025",
    },
    {
      id: "3",
      title: "Campus News App Launches Soon",
      description:
        "TMC introduces 'InsideTMC' — your one-stop app for campus updates and events!",
      image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60",
      date: "October 6, 2025",
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campus News</Text>
      </View>
      <FlatList
        data={newsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/* 🔹 BOTTOM TABS: Home | News | Profile */
/* -------------------------------------------------------------------------- */
function BottomTabs() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#3B82F6",
          tabBarInactiveTintColor: "#64748B",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 0,
            elevation: 8,
            position: "absolute",
            marginBottom: 10, // lifts tab bar above system nav
            marginHorizontal: 10,
            borderRadius: 20,
            height: 65,
            paddingBottom: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={UserHomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="News"
          component={UserNewsScreen}
          options={{
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
          name="Profile"
          component={UserProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/* 🔹 CUSTOM DRAWER CONTENT (with Logout) */
/* -------------------------------------------------------------------------- */
function CustomDrawerContent({ navigation, ...props }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

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
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/* 🔹 DRAWER NAVIGATION */
/* -------------------------------------------------------------------------- */
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
        name="Main"
        component={BottomTabs}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={UserSettingsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Help"
        component={HelpScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

/* -------------------------------------------------------------------------- */
/* 🚀 EXPORT MAIN USER DRAWER NAVIGATOR */
/* -------------------------------------------------------------------------- */
export default function UserDrawerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="User" component={DrawerScreens} />
    </Stack.Navigator>
  );
}

/* -------------------------------------------------------------------------- */
/* 🎨 STYLES */
/* -------------------------------------------------------------------------- */
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#1E293B",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 180,
  },
  cardContent: {
    padding: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: "#94A3B8",
  },
});