import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screen/DashboardScreen';
import CategoriesScreen from '../screen/CategoriesScreen';
import ManageNewsScreen from '../screen/ManageNewsScreen';
import ManageUsersScreen from '../screen/ManageUsersScreen';
import AddUserScreen from '../screen/AddUserScreen';
import EditUserScreen from '../screen/EditUserScreen';
import SettingsScreen from '../screen/SettingsScreen';
import CreateNewsScreen from '../screen/CreateNewsScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function DrawerScreens() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1E293B' },
        headerTintColor: '#fff',
        drawerActiveBackgroundColor: '#3B82F6',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#333',
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
        name="Categories"
        component={CategoriesScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shape-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Manage News"
        component={ManageNewsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="newspaper-variant-outline" size={size} color={color} />
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

export default function AdminDrawerNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Admin" component={DrawerScreens} options={{ headerShown: false }} />
      <Stack.Screen
        name="CreateNews"
        component={CreateNewsScreen}
        options={{
          title: 'Create News',
          headerStyle: { backgroundColor: '#1E293B' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="AddUser"
        component={AddUserScreen}
        options={{
          title: 'Add User',
          headerStyle: { backgroundColor: '#1E293B' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="EditUser"
        component={EditUserScreen}
        options={{
          title: 'Edit User',
          headerStyle: { backgroundColor: '#1E293B' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}