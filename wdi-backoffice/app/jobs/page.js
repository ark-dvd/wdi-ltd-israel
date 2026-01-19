'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchJobs(); }, []);

  async function fetchJobs() {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) { setJobs([]); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wdi-blue"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wdi-blue">משרות</h1>
          <p className="text-gray-600 mt-1">{jobs.length} משרות</p>
        </div>
        <Link href="/jobs/new" className="btn-gold">+ הוסף משרה</Link>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <Link key={job._id} href={`/jobs/${job._id}`} className="block bg-white rounded-xl p-6 shadow-sm card-hover border border-gray-100 hover:border-wdi-gold">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{job.title}</h3>
                <p className="text-gray-500">{job.location} | {job.type}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${job.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {job.isActive !== false ? 'פעיל' : 'לא פעיל'}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {jobs.length === 0 && <div className="text-center py-12 text-gray-500">אין משרות פתוחות</div>}
    </div>
  );
}
