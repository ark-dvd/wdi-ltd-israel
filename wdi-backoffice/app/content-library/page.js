'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ContentLibraryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content-library')
      .then(res => res.json())
      .then(data => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wdi-blue"></div>
      </div>
    );
  }

  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wdi-blue">מאגר מידע</h1>
          <p className="text-gray-600 mt-1">{items.length} קישורים</p>
        </div>
        <Link href="/content-library/new" className="btn-gold">+ הוסף קישור</Link>
      </div>

      {categories.map(category => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-4">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.filter(i => i.category === category).map((item) => (
              <Link
                key={item._id}
                href={`/content-library/${item._id}`}
                className="bg-white rounded-xl p-4 shadow-sm card-hover border border-gray-100 hover:border-wdi-gold"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🔗</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
                    <p className="text-wdi-gold text-xs mt-2 truncate">{item.url}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
