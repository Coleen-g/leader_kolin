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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// ✅ Firebase imports
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; // make sure path is correct

export default function LoginScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ handleLogin now checks Firestore only
  const handleLogin = async () => {
    if (username.trim() === "" || password.trim() === "") {
      alert("Please enter both username and password");
      return;
    }

    setLoading(true);

    try {
      // 🔍 Check Firestore for username (case-insensitive, strict)
      const trimmedUsername = username.trim();

      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);

      let foundUser = null;
      querySnapshot.forEach((doc) => {
        const existingUsername = doc.data().username;
        if (existingUsername && existingUsername.trim() === trimmedUsername) {
          foundUser = { ...doc.data(), docId: doc.id };
        }
      });

      if (!foundUser) {
        setLoading(false);
        alert("User not found. Please check your username or sign up.");
        return;
      }

      if (foundUser.password !== password) {
        setLoading(false);
        alert("Incorrect password. Please try again.");
        return;
      }

      // Successful login
      alert("Login successful!");
      if (foundUser.role === "admin") {
        navigation.replace("AdminDrawer");
      } else if (foundUser.role === "editor") {
        navigation.replace("EditorDrawer");
      } else {
        navigation.replace("UserDrawer");
      }

      setLoading(false);
      return;
    } catch (error) {
      console.error("Login error: ", error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
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
          <Text style={styles.title}>Welcome Back</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
          />

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

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don’t have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.signupBold}>Sign Up</Text>
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
    padding: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    width: "100%",
    backgroundColor: "#1976d2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
  },
  signupText: {
    color: "#fff",
    fontSize: 14,
  },
  signupBold: {
    color: "#ffeb3b",
    fontWeight: "bold",
    fontSize: 14,
  },
});
