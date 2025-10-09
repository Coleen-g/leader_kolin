// App.js
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./HomeScreen";
import DetailsScreen from "./DetailsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Hide header on Home */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        {/* Keep styled header on Details */}
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{
            title: "News Details",
            headerStyle: { backgroundColor: "#007bff" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontSize: 18 },
            headerTitleAlign: "center",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}