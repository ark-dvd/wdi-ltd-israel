'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => setClients(data))
      .finally(() => setLoading(false));
  }, []);

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
        {clients.map((client) => (
          <Link
            key={client._id}
            href={`/clients/${client._id}`}
            className="bg-white rounded-xl p-4 shadow-sm card-hover border border-gray-100 hover:border-wdi-gold text-center"
          >
            <div className="h-16 flex items-center justify-center text-3xl text-gray-400 mb-2">
              🏢
            </div>
            <p className="font-medium text-gray-800 text-sm">{client.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
