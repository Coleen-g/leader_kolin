import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function WelcomePage({ navigation }) {
  return (
    <View style={styles.container}>
      {/* App Title */}
      <Text style={styles.title}>NewsWatch</Text>
      <Text style={styles.subtitle}>Stay updated with the latest news</Text>

      {/* Sign In Button */}
      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate("SignUp")}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // white background
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007ACC", // blue color
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 40,
    textAlign: "center",
  },
  buttonPrimary: {
    width: "80%",
    backgroundColor: "#007ACC",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonSecondary: {
    width: "80%",
    backgroundColor: "#005f99",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});