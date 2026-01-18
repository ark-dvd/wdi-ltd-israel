'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const categoryLabels = {
  security: 'ביטחון',
  commercial: 'מסחרי',
  industrial: 'תעשייה',
  residential: 'מגורים',
  infrastructure: 'תשתיות',
  public: 'ציבורי',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

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
          <h1 className="text-3xl font-bold text-wdi-blue">פרויקטים</h1>
          <p className="text-gray-600 mt-1">{projects.length} פרויקטים</p>
        </div>
        <Link href="/projects/new" className="btn-gold">
          + הוסף פרויקט
        </Link>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm ${filter === 'all' ? 'bg-wdi-blue text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          הכל ({projects.length})
        </button>
        {Object.entries(categoryLabels).map(([key, label]) => {
          const count = projects.filter(p => p.category === key).length;
          if (count === 0) return null;
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <Link
            key={project._id}
            href={`/projects/${project._id}`}
            className="bg-white rounded-xl overflow-hidden shadow-sm card-hover border border-gray-100 hover:border-wdi-gold"
          >
            <div className="h-40 bg-gray-200 flex items-center justify-center text-4xl text-gray-400">
              🏗️
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-800 mb-1">{project.title}</h3>
              <p className="text-gray-500 text-sm mb-2">{project.client}</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                  {categoryLabels[project.category] || project.category}
                </span>
                {project.featured && (
                  <span className="px-2 py-0.5 rounded text-xs bg-wdi-gold text-white">
                    מומלץ
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
