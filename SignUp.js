import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons"; // icons

export default function SignUp({navigation}) {
  const [role, setRole] = useState("reporter");

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo + App Name */}
      <Text style={styles.logo}>📰 NewsWatch</Text>

      {/* Username */}
      <TextInput style={styles.input} placeholder="Username" />

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
      />

      {/* Phone */}
      <TextInput
        style={styles.input}
        placeholder="00000000000"
        keyboardType="phone-pad"
      />

      {/* Password */}
      <TextInput style={styles.input} placeholder="Password" secureTextEntry />

      {/* Role Selection */}
      <View style={styles.roleContainer}>
        <TouchableOpacity onPress={() => setRole("reporter")}>
          <Text style={role === "reporter" ? styles.roleActive : styles.role}>
            Media Reporter
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRole("visitor")}>
          <Text style={role === "visitor" ? styles.roleActive : styles.role}>
            Visitor
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Divider */}
      <Text style={styles.divider}>or sign in with</Text>

      {/* Social Icons */}
      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.iconBox}>
          <FontAwesome name="google" size={24} color="#DB4437" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBox}>
          <FontAwesome name="facebook" size={24} color="#1877F2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBox}>
          <FontAwesome name="twitter" size={24} color="#1DA1F2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBox}>
          <FontAwesome name="instagram" size={24} color="#C13584" />
        </TouchableOpacity>
      </View>

      {/* Terms */}
      <Text style={styles.terms}>
        By signing up to NewsWatch you are accepting our{" "}
        <Text style={{ fontWeight: "bold" }}>Terms & Conditions</Text>
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#007ACC",
  },
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginVertical: 10,
    fontSize: 16,
    padding: 8,
  },
  roleContainer: {
    flexDirection: "row",
    marginVertical: 15,
    justifyContent: "space-between",
    width: "80%",
  },
  role: {
    fontSize: 16,
    color: "#444",
  },
  roleActive: {
    fontSize: 16,
    color: "#007ACC",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#00AEEF",
    padding: 15,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  divider: {
    marginVertical: 15,
    color: "#888",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "70%",
    marginBottom: 20,
  },
  iconBox: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  terms: {
    fontSize: 12,
    textAlign: "center",
    color: "#555",
  },
});