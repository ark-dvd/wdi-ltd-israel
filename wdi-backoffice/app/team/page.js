'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const categoryLabels = {
  management: 'הנהלה',
  administration: 'אדמיניסטרציה',
  'department-heads': 'ראשי תחומים',
  'project-managers': 'מנהלי פרויקטים',
};

export default function TeamPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTeam();
  }, []);

  async function fetchTeam() {
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      setTeam(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTeam = filter === 'all' 
    ? team 
    : team.filter(m => m.category === filter);

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
          <h1 className="text-3xl font-bold text-wdi-blue">צוות</h1>
          <p className="text-gray-600 mt-1">{team.length} חברי צוות</p>
        </div>
        <Link href="/team/new" className="btn-gold">
          + הוסף חבר צוות
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm ${filter === 'all' ? 'bg-wdi-blue text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          הכל ({team.length})
        </button>
        {Object.entries(categoryLabels).map(([key, label]) => {
          const count = team.filter(m => m.category === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm ${filter === key ? 'bg-wdi-blue text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeam.map((member) => (
          <Link
            key={member._id}
            href={`/team/${member._id}`}
            className="bg-white rounded-xl p-4 shadow-sm card-hover border border-gray-100 hover:border-wdi-gold"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl text-gray-400">
                {member.image ? '👤' : '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800">{member.name}</h3>
                <p className="text-gray-500 text-sm">{member.role}</p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${
                  member.category === 'management' ? 'bg-purple-100 text-purple-700' :
                  member.category === 'administration' ? 'bg-blue-100 text-blue-700' :
                  member.category === 'department-heads' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {categoryLabels[member.category] || member.category}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
