import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import SplashScreen from "./screen/SplashScreen";
import LoginScreen from "./screen/LoginScreen";
import RegisterScreen from "./screen/RegisterScreen";
import AboutCreatorScreen from "./screen/AboutCreatorScreen";
import AdminDrawerNavigator from "./navigation/AdminDrawerNavigator";
import EditorDrawerNavigator from "./navigation/EditorDrawerNavigator";
import UserDrawerNavigator from "./navigation/UserDrawerNavigator";
import { AppProvider } from "./context/AppContext";

const Stack = createStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="AboutCreator" component={AboutCreatorScreen} />
            <Stack.Screen name="AdminDrawer" component={AdminDrawerNavigator} />
            <Stack.Screen name="EditorDrawer" component={EditorDrawerNavigator} />
            <Stack.Screen name="UserDrawer" component={UserDrawerNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </AppProvider>
  );
}