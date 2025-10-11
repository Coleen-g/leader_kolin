import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
    navigation.replace("Home");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>NewsWatch</Text>

      <TextInput
        style={styles.input}
        placeholder="Username or Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity>
        <Text style={styles.forgot}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>or sign in with</Text>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBox}>
          <AntDesign name="google" size={24} color="red" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBox}>
          <FontAwesome name="facebook" size={24} color="#1877F2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBox}>
          <AntDesign name="twitter" size={24} color="#1DA1F2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBox}>
          <AntDesign name="instagram" size={24} color="#C13584" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.registerText}>
          Don’t have an account? <Text style={styles.link}>Register</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#fff" },
  logo: { fontSize: 28, fontWeight: "bold", color: "#0288D1", marginBottom: 40 },
  input: { width: "100%", borderBottomWidth: 1, borderBottomColor: "#aaa", marginVertical: 12, padding: 8 },
  forgot: { alignSelf: "flex-end", color: "#0288D1", marginBottom: 20 },
  button: { backgroundColor: "#0288D1", width: "100%", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  orText: { marginVertical: 20, color: "#666" },
  socialRow: { flexDirection: "row", justifyContent: "space-around", width: "80%", marginBottom: 20 },
  socialBox: { borderWidth: 1, borderColor: "#aaa", borderRadius: 8, padding: 10 },
  registerText: { color: "#333" },
  link: { color: "#0288D1", fontWeight: "bold" },
});