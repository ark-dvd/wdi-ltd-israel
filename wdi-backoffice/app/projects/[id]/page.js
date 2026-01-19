'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Consistent Hebrew categories - MUST match page.js and new/page.js
const PROJECT_CATEGORIES = [
  { value: 'בטחוני', label: 'בטחוני' },
  { value: 'מסחרי', label: 'מסחרי' },
  { value: 'תעשייה', label: 'תעשייה' },
  { value: 'תשתיות', label: 'תשתיות' },
  { value: 'מגורים', label: 'מגורים' },
];

export default function ProjectEditPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  async function fetchProject() {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      } else {
        setMessage('פרויקט לא נמצא');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setMessage('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!project.title || !project.client) {
      setMessage('שם פרויקט ולקוח הם שדות חובה');
      return;
    }

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
        setMessage(`שגיאה: ${error.error || 'שגיאה בשמירה'}`);
      }
    } catch (error) {
      setMessage('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הפרויקט?')) return;
    
    try {
      const res = await fetch(`/api/projects/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/projects');
      } else {
        setMessage('שגיאה במחיקה');
      }
    } catch (error) {
      setMessage('שגיאה במחיקה');
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setMessage('יש להעלות קובץ תמונה בלבד');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('גודל התמונה חייב להיות עד 5MB');
      return;
    }
    
    setUploading(true);
    setMessage('מעלה תמונה...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'images/projects');
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.image) {
        setProject(prev => ({ ...prev, image: data.image }));
        setMessage('תמונה הועלתה! לחץ שמור לשמירה ✓');
      } else {
        setMessage(`שגיאה: ${data.error || 'שגיאה בהעלאה'}`);
      }
    } catch (error) {
      setMessage('שגיאה בהעלאת תמונה');
    } finally {
      setUploading(false);
    }
  }

  function updateField(field, value) {
    setProject(prev => ({ ...prev, [field]: value }));
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

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">פרויקט לא נמצא</p>
        <Link href="/projects" className="text-wdi-blue hover:text-wdi-gold">חזרה לרשימה</Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(project.image);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="text-gray-400 hover:text-gray-600">
            → חזרה לרשימה
          </Link>
          <h1 className="text-2xl font-bold text-wdi-blue">עריכת {project.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-sm ${message.includes('✓') ? 'text-green-500' : 'text-red-500'}`}>
              {message}
            </span>
          )}
          <button onClick={handleDelete} className="px-4 py-2 text-red-500 hover:text-red-700 text-sm">
            מחק
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Image */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-wdi-blue mb-4">תמונה ראשית</h2>
          <div className="flex items-start gap-6">
            <div className="w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt={project.title} className="w-full h-full object-cover" />
              ) : (
                '📷'
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer px-4 py-2 rounded-lg text-sm inline-block ${
                  uploading ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {uploading ? 'מעלה...' : (imageUrl ? 'החלף תמונה' : 'העלה תמונה')}
              </label>
              <p className="text-xs text-gray-500 mt-2">JPG, PNG או WebP עד 5MB</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-wdi-blue mb-4">פרטי הפרויקט</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">שם הפרויקט *</label>
              <input
                type="text"
                value={project.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">לקוח *</label>
              <input
                type="text"
                value={project.client || ''}
                onChange={(e) => updateField('client', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
              <select
                value={project.category || 'מסחרי'}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              >
                {PROJECT_CATEGORIES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מיקום</label>
              <input
                type="text"
                value={project.location || ''}
                onChange={(e) => updateField('location', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שנה</label>
              <input
                type="number"
                value={project.year || ''}
                onChange={(e) => updateField('year', parseInt(e.target.value) || '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
                min="2000"
                max="2030"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">גודל (מ"ר)</label>
              <input
                type="text"
                value={project.size || ''}
                onChange={(e) => updateField('size', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סדר תצוגה</label>
              <input
                type="number"
                value={project.order || 100}
                onChange={(e) => updateField('order', parseInt(e.target.value) || 100)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
              <textarea
                value={project.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={project.featured || false}
                  onChange={(e) => updateField('featured', e.target.checked)}
                  className="w-4 h-4 text-wdi-blue border-gray-300 rounded focus:ring-wdi-blue"
                />
                <span className="text-sm font-medium text-gray-700">פרויקט מומלץ (יוצג בעמוד הבית)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
