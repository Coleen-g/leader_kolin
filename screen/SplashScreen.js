import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions, Image, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ navigation }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const moveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Spin animation
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: true,
    }).start(() => {
      // Move + shrink + fade in text
      Animated.parallel([
        Animated.timing(moveAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          navigation.replace("Login"); // Navigate to Login screen
        }, 1000);
      });
    });
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const moveX = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });

  return (
    <LinearGradient colors={["#003366", "#004C99", "#0066CC"]} style={styles.container}>
      <View style={styles.center}>
        <Animated.Image
          source={require("../assets/logo.png")}
          style={[
            styles.logo,
            {
              transform: [{ rotate: spin }, { translateX: moveX }, { scale: scaleAnim }],
              tintColor: "#FFFFFF",
            },
          ]}
          resizeMode="contain"
        />
        <Animated.Text
          style={[
            styles.text,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          InsideTMC
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: width * 0.5, height: height * 0.25, marginBottom: 10 },
  text: { fontSize: 36, color: "#FFFFFF", fontWeight: "900", letterSpacing: 1.5 },
});