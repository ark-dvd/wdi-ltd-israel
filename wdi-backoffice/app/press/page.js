'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PressPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/press')
      .then(res => res.json())
      .then(data => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  function getImageUrl(image) {
    if (!image?.asset?._ref) return null;
    const ref = image.asset._ref;
    const [, id, dimensions, format] = ref.split('-');
    return `https://cdn.sanity.io/images/hrkxr0r8/production/${id}-${dimensions}.${format}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wdi-blue"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-wdi-blue">כתבו עלינו</h1>
          <p className="text-gray-500">{items.length} כתבות</p>
        </div>
        <Link href="/press/new" className="btn-gold">
          + הוסף כתבה
        </Link>
      </div>

      <div className="grid gap-4">
        {items.map((item) => {
          const logoUrl = getImageUrl(item.logo);
          return (
            <Link
              key={item._id}
              href={`/press/${item._id}`}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-20 h-14 bg-gray-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt={item.source} className="max-w-full max-h-full object-contain p-1" />
                ) : (
                  <span className="text-2xl">📰</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-wdi-blue truncate">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.source}</p>
              </div>
              <div className="text-left text-sm text-gray-400 flex-shrink-0">
                {item.date && new Date(item.date).toLocaleDateString('he-IL')}
              </div>
            </Link>
          );
        })}

        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            אין כתבות. לחץ על "הוסף כתבה" להתחיל.
          </div>
        )}
      </div>
    </div>
  );
}
