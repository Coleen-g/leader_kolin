import React from 'react';

export default function Sidebar({ events, bookmarks, articles, setSelectedArticle, toggleBookmark, profile, updateProfile, requestNotificationPermission }) {
  return (
    <aside className="space-y-4">
      {/* Events */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Upcoming Events</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {events.map((e) => (
            <li key={e.id} className="border rounded p-2">
              <div className="font-medium">{e.title}</div>
              <div className="text-xs text-gray-500">{e.date} • {e.time} • {e.venue}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Bookmarks */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Bookmarks</h3>
        <ul className="mt-2 text-sm space-y-2">
          {bookmarks.length === 0 && <li className="text-gray-500">No bookmarks yet.</li>}
          {bookmarks.map((id) => {
            const a = articles.find((x) => x.id === id);
            if (!a) return null;
            return (
              <li key={id} className="flex justify-between items-center">
                <div>{a.title}</div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedArticle(a)} className="text-xs text-blue-600">Open</button>
                  <button onClick={() => toggleBookmark(id)} className="text-xs">Remove</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Profile */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Profile</h3>
        <div className="mt-2 text-sm">
          <label className="block text-xs text-gray-600">Name</label>
          <input
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
            className="w-full px-2 py-1 border rounded mt-1"
          />

          <label className="block text-xs text-gray-600 mt-2">Notifications</label>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => updateProfile({ notifications: !profile.notifications })}
              className={`px-3 py-1 border rounded ${profile.notifications ? 'bg-green-200' : ''}`}
            >
              {profile.notifications ? 'On' : 'Off'}
            </button>
            <button onClick={requestNotificationPermission} className="px-3 py-1 border rounded">
              Request Permission
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
