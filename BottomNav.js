import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { styles } from "./styles";

export default function BottomNav({ activeScreen, setActiveScreen }) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[
          styles.navItem,
          activeScreen === "Post" && styles.navItemActive,
        ]}
        onPress={() => setActiveScreen("Post")}
      >
        <Text
          style={[
            styles.navText,
            activeScreen === "Post" && styles.navTextActive,
          ]}
        >
          📝 Post
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navItem,
          activeScreen === "Submissions" && styles.navItemActive,
        ]}
        onPress={() => setActiveScreen("Submissions")}
      >
        <Text
          style={[
            styles.navText,
            activeScreen === "Submissions" && styles.navTextActive,
          ]}
        >
          📤 Submissions
        </Text>
      </TouchableOpacity>
    </View>
  );
}