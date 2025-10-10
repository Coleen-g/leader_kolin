import React, { useState } from 'react';

export default function CommentSection({ article, onAdd }) {
  const [text, setText] = useState('');

  return (
    <div className="mt-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full border rounded p-2"
        placeholder="Write a comment..."
      ></textarea>

      <div className="mt-2 flex gap-2">
        <button
          onClick={() => {
            onAdd(text);
            setText('');
          }}
          className="px-3 py-1 border rounded"
        >
          Post Comment
        </button>
        <button onClick={() => navigator.clipboard?.writeText(text)} className="px-3 py-1 border rounded">
          Copy
        </button>
      </div>
    </div>
  );
}
