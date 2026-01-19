'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PressPage() {
  const [press, setPress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPress();
  }, []);

  async function fetchPress() {
    try {
      const res = await fetch('/api/press');
      const data = await res.json();
      setPress(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching press:', error);
      setPress([]);
    } finally {
      setLoading(false);
    }
  }

  function getImageUrl(image) {
    if (!image) return null;
    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;
      return `https://wdi.co.il${image.startsWith('/') ? '' : '/'}${image}`;
    }
    return null;
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wdi-blue">כתבו עלינו</h1>
          <p className="text-gray-600 mt-1">{press.length} כתבות</p>
        </div>
        <Link href="/press/new" className="btn-gold">
          + הוסף כתבה
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {press.map((item) => {
          const logoUrl = getImageUrl(item.logo);
          return (
            <Link
              key={item._id}
              href={`/press/${item._id}`}
              className="bg-white rounded-xl p-4 shadow-sm card-hover border border-gray-100 hover:border-wdi-gold"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt={item.source} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-2xl">📰</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.source}</p>
                  {item.date && (
                    <p className="text-gray-400 text-xs mt-1">{item.date}</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {press.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          אין כתבות. לחץ "+ הוסף כתבה" כדי להוסיף את הראשונה.
        </div>
      )}
    </div>
  );
}
