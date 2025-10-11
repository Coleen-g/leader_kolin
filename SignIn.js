import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function SignIn({navigation}) {
  const [showPassword, setShowPassword] = useState(false);

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

      {/* Password with toggle */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
          placeholder="Password"
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
        >
          <FontAwesome
            name={showPassword ? "eye" : "eye-slash"}
            size={20}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity style={styles.forgotButton}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Sign In</Text>
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

      {/* Register link */}
      <Text style={styles.registerText}>
        Don’t have an account? <Text style={styles.registerLink}>Register</Text>
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginVertical: 10,
  },
  eyeButton: {
    padding: 8,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginVertical: 5,
  },
  forgotText: {
    color: "#007ACC",
    fontSize: 13,
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
  registerText: {
    fontSize: 13,
    color: "#444",
  },
  registerLink: {
    color: "#007ACC",
    fontWeight: "bold",
  },
});