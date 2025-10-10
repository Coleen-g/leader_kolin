import React from 'react';

export default function ArticleList({ articles, filtered, toggleLike, toggleBookmark, shareArticle, bookmarks, setSelectedArticle, setToast }) {
  return (
    <div className="space-y-4">
      {filtered.map((a) => (
        <article key={a.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
          <img src={a.image || 'https://via.placeholder.com/160'} alt="thumb" className="w-36 h-24 object-cover rounded" />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{a.title}</h2>
                <div className="text-xs text-gray-500">{a.category} • {a.date}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleLike(a.id)} className="text-sm px-2 py-1 border rounded">👍 {a.likes}</button>
                <button
                  onClick={() => toggleBookmark(a.id)}
                  className={`text-sm px-2 py-1 border rounded ${bookmarks.includes(a.id) ? 'bg-yellow-200' : ''}`}
                >
                  🔖
                </button>
                <button onClick={() => shareArticle(a)} className="text-sm px-2 py-1 border rounded">Share</button>
              </div>
            </div>

            <p className="mt-2 text-sm text-gray-700">{a.summary}</p>

            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => setSelectedArticle(a)} className="text-sm text-blue-600">Read more</button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(a.title + ' — ' + a.summary);
                  setToast({ title: 'Copied', body: 'Article title + summary copied', id: Date.now() });
                }}
                className="text-sm"
              >
                Copy
              </button>
            </div>
          </div>
        </article>
      ))}

      {filtered.length === 0 && <div className="text-center text-gray-500 p-12 bg-white rounded">No articles found.</div>}
    </div>
  );
}
