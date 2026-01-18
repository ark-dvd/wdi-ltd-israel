'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const serviceIcons = {
  'drafting-compass': '📐',
  'file-alt': '📄',
  'hard-hat': '👷',
  'users': '👥',
  'project-diagram': '📊',
  'clipboard-check': '✅',
  'book': '📚',
  'file-signature': '📝',
};

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wdi-blue">שירותים</h1>
          <p className="text-gray-600 mt-1">ניהול שירותי החברה ועמודי השירות</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-amber-800">
          <strong>💡 טיפ:</strong> לחץ על שירות כדי לערוך את תוכן העמוד המלא שלו באתר
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Link
            key={service._id}
            href={`/services/${service._id}`}
            className="bg-white rounded-xl p-6 shadow-sm card-hover border border-gray-100 hover:border-wdi-gold"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-wdi-blue rounded-lg flex items-center justify-center text-2xl text-white flex-shrink-0">
                {serviceIcons[service.icon] || '⚙️'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{service.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">{service.shortDescription}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {service.isActive ? 'פעיל' : 'לא פעיל'}
                  </span>
                  <span className="text-wdi-gold text-sm">לחץ לעריכה ←</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
