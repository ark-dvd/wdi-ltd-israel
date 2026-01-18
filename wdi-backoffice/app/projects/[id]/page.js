'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const categoryOptions = [
  { value: 'בטחוני', label: 'בטחוני' },
  { value: 'מסחרי', label: 'מסחרי' },
  { value: 'תעשייתי', label: 'תעשייתי' },
  { value: 'מגורים', label: 'מגורים' },
  { value: 'תשתיות', label: 'תשתיות' },
  { value: 'ציבורי', label: 'ציבורי' },
];

const serviceOptions = [
  'ניהול תכנון',
  'מסמכי דרישות, אפיון ופרוגרמה',
  'ניהול ביצוע ופיקוח',
  'ייצוג בעלי עניין',
  'ניהול והבטחת איכות',
  'ניהול תב״ע והיתרים',
  'שירותי PMO',
  'ניהול הידע בפרויקט',
];

export default function ProjectEditPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${params.id}`)
      .then(res => res.json())
      .then(data => setProject(data))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (res.ok) {
        setMessage('נשמר בהצלחה! ✓');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await res.json();
        setMessage(`שגיאה: ${error.error}`);
      }
    } catch (error) {
      setMessage('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('האם למחוק את הפרויקט?')) return;
    try {
      await fetch(`/api/projects/${params.id}`, { method: 'DELETE' });
      router.push('/projects');
    } catch (error) {
      setMessage('שגיאה במחיקה');
    }
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const currentImages = project.images || [];
    if (currentImages.length + files.length > 10) {
      setMessage('ניתן להעלות עד 10 תמונות');
      return;
    }
    
    setUploading(true);
    setMessage('');
    
    try {
      const newImages = [...currentImages];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'images/projects');
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.image) {
          newImages.push(data.image);
        }
      }
      
      setProject(prev => ({ ...prev, images: newImages }));
      setMessage('תמונות הועלו! לחץ שמור כדי לשמור');
    } catch (error) {
      setMessage('שגיאה בהעלאת תמונות');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index) {
    const newImages = project.images.filter((_, i) => i !== index);
    setProject(prev => ({ ...prev, images: newImages }));
  }

  function updateField(field, value) {
    setProject(prev => ({ ...prev, [field]: value }));
  }

  function toggleService(service) {
    const services = project.services || [];
    if (services.includes(service)) {
      updateField('services', services.filter(s => s !== service));
    } else {
      updateField('services', [...services, service]);
    }
  }

  function getImageUrl(image) {
    if (!image) return null;
    if (typeof image === 'string') {
      if (image.startsWith('/')) return `https://wdi.co.il${image}`;
      return image;
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

  if (!project) {
    return <div className="text-center py-12">פרויקט לא נמצא</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="text-gray-500 hover:text-wdi-blue">← חזרה</Link>
          <h1 className="text-2xl font-bold text-wdi-blue">{project.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className={`text-sm ${message.includes('שגיאה') ? 'text-red-500' : 'text-green-500'}`}>{message}</span>}
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">תמונות ({(project.images || []).length}/10)</label>
          <div className="flex flex-wrap gap-3 mb-3">
            {(project.images || []).map((img, index) => {
              const url = getImageUrl(img);
              return url ? (
                <div key={index} className="relative w-24 h-24 group">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ) : null;
            })}
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-wdi-gold">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <span className="text-gray-400">{uploading ? '...' : '+'}</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם הפרויקט *</label>
          <input
            type="text"
            value={project.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">לקוח / מזמין עבודה *</label>
          <input
            type="text"
            value={project.client || ''}
            onChange={(e) => updateField('client', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
            <select
              value={project.category || 'מסחרי'}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שנה</label>
            <input
              type="text"
              value={project.year || ''}
              onChange={(e) => updateField('year', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
          <textarea
            value={project.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">שירותים</label>
          <div className="grid grid-cols-2 gap-2">
            {serviceOptions.map(service => (
              <label key={service} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(project.services || []).includes(service)}
                  onChange={() => toggleService(service)}
                  className="w-4 h-4"
                />
                {service}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={project.featured === true}
              onChange={(e) => updateField('featured', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">פרויקט מומלץ (מוצג בעמוד הראשי)</span>
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleDelete} className="text-red-500 hover:text-red-700 text-sm">
          🗑️ מחק פרויקט
        </button>
      </div>
    </div>
  );
}
