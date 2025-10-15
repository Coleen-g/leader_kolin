import React, { useState, useEffect } from 'react';
import { initialArticles } from './data/articles';
import { initialEvents } from './data/events';
import CommentSection from './components/CommentSection';
import ArticleList from './components/ArticleList';
import Sidebar from './components/Sidebar';
import Toasts from './components/Toasts';

export default function StudentReader() {
  // --- States & logic ---
  const [articles, setArticles] = useState(() => {
    const saved = localStorage.getItem('sr_articles_v1');
    return saved ? JSON.parse(saved) : initialArticles;
  });
  const [events] = useState(initialEvents);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('sr_bookmarks_v1');
    return saved ? JSON.parse(saved) : [];
  });
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('sr_profile_v1');
    return saved ? JSON.parse(saved) : { name: 'Student Reader', avatar: '', notifications: true };
  });
  const [notificationPermission, setNotificationPermission] = useState('denied');
  const [toasts, setToastList] = useState([]);

  const setToast = (t) => {
    setToastList((s) => [...s, t]);
    setTimeout(() => setToastList((s) => s.filter((x) => x.id !== t.id)), 4000);
  };

  // Local storage sync
  useEffect(() => localStorage.setItem('sr_articles_v1', JSON.stringify(articles)), [articles]);
  useEffect(() => localStorage.setItem('sr_bookmarks_v1', JSON.stringify(bookmarks)), [bookmarks]);
  useEffect(() => localStorage.setItem('sr_profile_v1', JSON.stringify(profile)), [profile]);

  // Notification setup
  useEffect(() => {
    if ('Notification' in window) setNotificationPermission(Notification.permission);
  }, []);

  // --- Helper functions ---
  function toggleLike(id) {
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, likes: a.likes + 1 } : a)));
  }

  function addComment(id, text) {
    if (!text.trim()) return;
    setArticles((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, comments: [...a.comments, { id: Date.now(), text }] } : a
      )
    );
  }

  function toggleBookmark(id) {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function shareArticle(a) {
    if (navigator.share) navigator.share({ title: a.title, text: a.summary });
    else {
      navigator.clipboard?.writeText(window.location.href + '#article=' + a.id);
      alert('Link copied to clipboard (fallback).');
    }
  }

  function requestNotificationPermission() {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notification');
      return;
    }
    Notification.requestPermission().then((perm) => setNotificationPermission(perm));
  }

  function sendNotification(title, body) {
    if (profile.notifications && notificationPermission === 'granted')
      new Notification(title, { body });
    else setToast({ title, body, id: Date.now() });
  }

  function simulateBreakingNews() {
    const sample = {
      id: Date.now(),
      title: 'Breaking: Short Announcement',
      summary: 'An important campus update.',
      content: 'More details coming soon.',
      category: 'Campus Life',
      date: new Date().toISOString().slice(0, 10),
      image: '',
      likes: 0,
      comments: [],
    };
    setArticles((s) => [sample, ...s]);
    sendNotification('Breaking News', sample.title);
  }

  const updateProfile = (newData) => setProfile((p) => ({ ...p, ...newData }));

  // Filters
  const categories = ['All', 'Sports', 'Campus Life', 'Events'];
  const filtered = articles.filter((a) => {
    if (activeTab !== 'All' && a.category !== activeTab) return false;
    if (query && !(a.title + a.summary + a.content).toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
  });

  // --- UI --
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Campus News</h1>
          <p className="text-sm text-gray-600">
            Latest news, events and campus life — for students
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={simulateBreakingNews}
            className="px-3 py-1 rounded-md border text-sm"
          >
            Simulate Breaking
          </button>
          <div className="flex items-center gap-2">
            <img
              src={
                profile.avatar ||
                'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.name)
              }
              alt="avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="text-right">
              <div className="text-sm font-medium">{profile.name}</div>
              <div className="text-xs text-gray-500">
                {profile.notifications ? 'Notif: On' : 'Notif: Off'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column */}
        <section className="md:col-span-2">
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex gap-2 items-center">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search news..."
                className="px-3 py-2 border rounded-md w-full md:w-96"
              />
              <button
                onClick={() => {
                  setQuery('');
                  setActiveTab('All');
                }}
                className="px-3 py-2 border rounded-md text-sm"
              >
                Clear
              </button>
            </div>

            <div className="flex gap-2 items-center">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveTab(c)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    activeTab === c ? 'bg-blue-600 text-white' : 'border'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <ArticleList
            articles={articles}
            filtered={filtered}
            toggleLike={toggleLike}
            toggleBookmark={toggleBookmark}
            shareArticle={shareArticle}
            bookmarks={bookmarks}
            setSelectedArticle={setSelectedArticle}
            setToast={setToast}
          />
        </section>

        {/* Sidebar */}
        <Sidebar
          events={events}
          bookmarks={bookmarks}
          articles={articles}
          setSelectedArticle={setSelectedArticle}
          toggleBookmark={toggleBookmark}
          profile={profile}
          updateProfile={updateProfile}
          requestNotificationPermission={requestNotificationPermission}
        />
      </main>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full rounded shadow-lg overflow-auto max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{selectedArticle.title}</h2>
                <div className="text-xs text-gray-500">
                  {selectedArticle.category} • {selectedArticle.date}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleLike(selectedArticle.id)}
                  className="px-2 py-1 border rounded"
                >
                  👍 {selectedArticle.likes}
                </button>
                <button
                  onClick={() => shareArticle(selectedArticle)}
                  className="px-2 py-1 border rounded"
                >
                  Share
                </button>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-2 py-1 border rounded"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-4">
              <p className="mb-4 text-gray-700">{selectedArticle.content}</p>
              <CommentSection
                comments={selectedArticle.comments}
                onAdd={(text) => addComment(selectedArticle.id, text)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <Toasts list={toasts} />
    </div>
  );
}