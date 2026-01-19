'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Consistent Hebrew categories across all project files
const PROJECT_CATEGORIES = {
  'בטחוני': 'בטחוני',
  'מסחרי': 'מסחרי',
  'תעשייה': 'תעשייה',
  'תשתיות': 'תשתיות',
  'מגורים': 'מגורים',
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
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wdi-blue">פרויקטים</h1>
          <p className="text-gray-600 mt-1">{projects.length} פרויקטים</p>
        </div>
        <Link href="/projects/new" className="btn-gold">
          + הוסף פרויקט
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm transition ${
            filter === 'all' 
              ? 'bg-wdi-blue text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          הכל ({projects.length})
        </button>
        {Object.entries(PROJECT_CATEGORIES).map(([key, label]) => {
          const count = projects.filter(p => p.category === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                filter === key 
                  ? 'bg-wdi-blue text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const imageUrl = getImageUrl(project.image);
          return (
            <Link
              key={project._id}
              href={`/projects/${project._id}`}
              className="bg-white rounded-xl shadow-sm overflow-hidden card-hover border border-gray-100 hover:border-wdi-gold"
            >
              <div className="h-40 bg-gray-200">
                {imageUrl && (
                  <img src={imageUrl} alt={project.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-1">{project.title}</h3>
                <p className="text-gray-500 text-sm mb-2">{project.client}</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-wdi-blue/10 text-wdi-blue text-xs rounded">
                    {PROJECT_CATEGORIES[project.category] || project.category}
                  </span>
                  {project.featured && (
                    <span className="px-2 py-0.5 bg-wdi-gold/20 text-wdi-gold text-xs rounded">
                      מומלץ
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {filter === 'all' ? 'אין פרויקטים' : `אין פרויקטים בקטגוריה "${PROJECT_CATEGORIES[filter]}"`}
        </div>
      )}
    </div>
  );
}
