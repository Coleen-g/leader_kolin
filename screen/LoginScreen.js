import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (username.trim() === "" || password.trim() === "") {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    const performLogin = async () => {
      setLoading(true);
      try {
        // Step 1: Lookup email from Firestore using username
        const q = query(collection(db, "users"), where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setLoading(false);
          Alert.alert("Login Failed", "Username not found");
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const email = userDoc.data().email;

        // Step 2: Sign in with email & password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Step 3: Check role from Firestore
        let role = userDoc.data().role || userDoc.data().Role || "";

        setLoading(false);

        // Step 4: Navigate based on role
        const roleLower = role.toString().toLowerCase();
        if (roleLower.includes("admin")) {
          navigation.replace("AdminDrawer");
        } else if (roleLower.includes("editor")) {
          navigation.replace("EditorDrawer");
        } else {
          navigation.replace("UserDrawer");
        }
      } catch (error) {
        setLoading(false);
        Alert.alert("Login Failed", error.message || "Invalid username or password");
      }
    };

    performLogin();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="school" size={60} color="#fff" />
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back!</Text>

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons name="account-outline" size={20} color="#7C3AED" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#CBCBCB"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#7C3AED" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#CBCBCB"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons 
                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color="#7C3AED" 
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>New user? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* About the Creator */}
          <TouchableOpacity
            style={styles.aboutCreator}
            onPress={() => navigation.navigate('AboutCreator')}
          >
            <Ionicons name="person-circle-outline" size={20} color="#7C3AED" style={styles.aboutIcon} />
            <Text style={styles.aboutText}>About the creator</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#667EEA",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 24,
    textAlign: "center",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: "#1E293B",
  },
  button: {
    width: "100%",
    backgroundColor: "#667EEA",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  signUpText: {
    color: "#64748B",
    fontSize: 14,
  },
  signUpLink: {
    color: "#667EEA",
    fontSize: 14,
    fontWeight: "700",
  },
  aboutCreator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  aboutIcon: {
    marginRight: 8,
  },
  aboutText: {
    color: '#64748B',
    fontSize: 14,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
