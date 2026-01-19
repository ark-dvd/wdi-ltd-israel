'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
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
          <h1 className="text-3xl font-bold text-wdi-blue">לקוחות</h1>
          <p className="text-gray-600 mt-1">{clients.length} לקוחות</p>
        </div>
        <Link href="/clients/new" className="btn-gold">+ הוסף לקוח</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {clients.map((client) => {
          const imageUrl = getImageUrl(client.logo || client.image);
          return (
            <Link
              key={client._id}
              href={`/clients/${client._id}`}
              className="bg-white rounded-xl p-4 shadow-sm card-hover border border-gray-100 hover:border-wdi-gold text-center"
            >
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-2">
                {imageUrl ? (
                  <img src={imageUrl} alt={client.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="text-3xl">🏢</span>
                )}
              </div>
              <h3 className="font-medium text-gray-800 text-sm">{client.name}</h3>
            </Link>
          );
        })}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          אין לקוחות. לחץ "+ הוסף לקוח" כדי להוסיף את הראשון.
        </div>
      )}
    </div>
  );
}
