'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => setJobs(data))
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
          <h1 className="text-3xl font-bold text-wdi-blue">משרות</h1>
          <p className="text-gray-600 mt-1">{jobs.length} משרות פעילות</p>
        </div>
        <Link href="/jobs/new" className="btn-gold">+ הוסף משרה</Link>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <Link
            key={job._id}
            href={`/jobs/${job._id}`}
            className="block bg-white rounded-xl p-6 shadow-sm card-hover border border-gray-100 hover:border-wdi-gold"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{job.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                  <span>📍 {job.location}</span>
                  <span>⏰ {job.type === 'full-time' ? 'משרה מלאה' : job.type}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${job.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {job.isActive ? 'פעיל' : 'לא פעיל'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
