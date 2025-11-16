import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

// ✅ Added Firebase imports
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; // adjust path if firebaseConfig.js is in another folder

export default function SignupScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    if (username.trim() === "" || password.trim() === "" || confirmPassword.trim() === "") {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // ✅ Enforce minimum password length
    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      // ✅ Check if username already exists (case-insensitive, strict check)
      const usersRef = collection(db, "users");
      const trimmedUsername = username.trim();

      // Get ALL users and check manually for exact (case-sensitive) matches
      const allUsersQuery = query(usersRef);
      const allUsersSnapshot = await getDocs(allUsersQuery);
      
      let usernameExists = false;
      allUsersSnapshot.forEach((doc) => {
        const existingUsername = doc.data().username;
        if (existingUsername && existingUsername.trim() === trimmedUsername) {
          usernameExists = true;
        }
      });

      if (usernameExists) {
        setLoading(false);
        Alert.alert(
          "Username taken",
          "This username is already in use. Please choose another."
        );
        return;
      }

      // Save user data to Firestore including role
      await addDoc(usersRef, {
        username: trimmedUsername,
        password: password,
        role: role,
        createdAt: new Date(),
      });

      setLoading(false);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error adding user: ", error);
      setLoading(false);
      Alert.alert("Error", "Failed to save user. Please try again.");
    }
  };

  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f" }}
      style={styles.background}
      blurRadius={0}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
          />

          {/* Password Field */}
          <View style={{ width: "100%", position: "relative" }}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 15,
                top: 15,
              }}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="#1976d2"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Field */}
          <View style={{ width: "100%", position: "relative" }}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: 15,
                top: 15,
              }}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={22}
                color="#1976d2"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginBold}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0d47a1",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    padding: 25,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0d47a1",
    marginBottom: 40,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#f5f6fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  pickerContainer: {
    width: "100%",
    backgroundColor: "#f5f6fa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
  },
  pickerLabel: {
    color: "#444",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 10,
    marginTop: 10,
  },
  picker: {
    width: "100%",
    height: 50,
  },
  button: {
    width: "100%",
    backgroundColor: "#1976d2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
  },
  loginText: {
    color: "#444",
    fontSize: 14,
  },
  loginBold: {
    color: "#1976d2",
    fontWeight: "bold",
    fontSize: 14,
  },
});
