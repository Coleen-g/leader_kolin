import React from 'react';

export default function Toasts({ toasts }) {
  return (
    <div className="fixed right-4 bottom-4 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="bg-white border rounded p-3 shadow">
          <div className="font-medium">{t.title}</div>
          <div className="text-sm text-gray-600">{t.body}</div>
        </div>
      ))}
    </div>
  );
}
