import React, { useState, useEffect } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PostScreen from "./PostScreen";
import SubmissionsScreen from "./SubmissionsScreen";
import BottomNav from "./BottomNav";
import { styles } from "./styles";

export default function EditorReporterComponent() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [message, setMessage] = useState("");
  const [mediaUri, setMediaUri] = useState(null);
  const [activeScreen, setActiveScreen] = useState("Post");

  const categories = ["Sports", "Events", "Academics", "News"];

  useEffect(() => {
    const loadData = async () => {
      const storedDrafts = await AsyncStorage.getItem("drafts");
      const storedSubs = await AsyncStorage.getItem("submissions");
      if (storedDrafts) setDrafts(JSON.parse(storedDrafts));
      if (storedSubs) setSubmissions(JSON.parse(storedSubs));
    };
    loadData();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("drafts", JSON.stringify(drafts));
  }, [drafts]);

  useEffect(() => {
    AsyncStorage.setItem("submissions", JSON.stringify(submissions));
  }, [submissions]);

  const showTempMsg = (txt, color = "#2563eb") => {
    setMessage({ text: txt, color });
    setTimeout(() => setMessage(""), 2500);
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("");
    setEditingId(null);
    setEditingType(null);
    setMediaUri(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {activeScreen === "Post" ? (
          <PostScreen
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            category={category}
            setCategory={setCategory}
            mediaUri={mediaUri}
            setMediaUri={setMediaUri}
            showTempMsg={showTempMsg}
            resetForm={resetForm}
            drafts={drafts}
            setDrafts={setDrafts}
            submissions={submissions}
            setSubmissions={setSubmissions}
            editingId={editingId}
            editingType={editingType}
            setEditingId={setEditingId}
            setEditingType={setEditingType}
            message={message}
            categories={categories}
          />
        ) : (
          <SubmissionsScreen
            submissions={submissions}
            drafts={drafts}
            setActiveScreen={setActiveScreen}
            setTitle={setTitle}
            setContent={setContent}
            setCategory={setCategory}
            setMediaUri={setMediaUri}
            setEditingId={setEditingId}
            setEditingType={setEditingType}
            setDrafts={setDrafts}
          />
        )}
      </ScrollView>

      <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
    </SafeAreaView>
  );
}