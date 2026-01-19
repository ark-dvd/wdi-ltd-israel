'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTestimonials(); }, []);

  async function fetchTestimonials() {
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (error) { setTestimonials([]); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wdi-blue"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wdi-blue">המלצות</h1>
          <p className="text-gray-600 mt-1">{testimonials.length} המלצות</p>
        </div>
        <Link href="/testimonials/new" className="btn-gold">+ הוסף המלצה</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((item) => (
          <Link key={item._id} href={`/testimonials/${item._id}`} className="bg-white rounded-xl p-6 shadow-sm card-hover border border-gray-100 hover:border-wdi-gold">
            <div className="text-4xl mb-4 text-wdi-gold">"</div>
            <p className="text-gray-700 line-clamp-3 mb-4">{item.text}</p>
            <div className="border-t pt-4">
              <p className="font-bold text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-500">{item.title} | {item.company}</p>
            </div>
          </Link>
        ))}
      </div>

      {testimonials.length === 0 && <div className="text-center py-12 text-gray-500">אין המלצות</div>}
    </div>
  );
}
