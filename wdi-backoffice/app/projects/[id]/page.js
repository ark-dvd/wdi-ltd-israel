'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const categoryOptions = [
  { value: 'security', label: 'ביטחון' },
  { value: 'commercial', label: 'מסחרי' },
  { value: 'industrial', label: 'תעשייה' },
  { value: 'residential', label: 'מגורים' },
  { value: 'infrastructure', label: 'תשתיות' },
  { value: 'public', label: 'ציבורי' },
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
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (res.ok) {
        setMessage('נשמר בהצלחה! ✓');
        setTimeout(() => setMessage(''), 3000);
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
    
    try {
      const newImages = [...currentImages];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.image) {
          newImages.push(data.image);
        }
      }
      
      // Update project with new images
      setProject(prev => ({ ...prev, images: newImages }));
      
      // Save to Sanity
      await fetch(`/api/projects/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: newImages }),
      });
      
      setMessage('תמונות הועלו בהצלחה! ✓');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('שגיאה בהעלאת תמונות');
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(index) {
    const newImages = project.images.filter((_, i) => i !== index);
    setProject(prev => ({ ...prev, images: newImages }));
    
    // Save to Sanity
    await fetch(`/api/projects/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: newImages }),
    });
    
    setMessage('תמונה הוסרה');
    setTimeout(() => setMessage(''), 2000);
  }

  function updateField(field, value) {
    setProject(prev => ({ ...prev, [field]: value }));
  }

  function getImageUrl(image) {
    if (!image?.asset?._ref) return null;
    const ref = image.asset._ref;
    const [, id, dimensions, format] = ref.split('-');
    return `https://cdn.sanity.io/images/hrkxr0r8/production/${id}-${dimensions}.${format}`;
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

  const images = project.images || [];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="text-gray-500 hover:text-wdi-blue">← חזרה</Link>
          <h1 className="text-2xl font-bold text-wdi-blue">{project.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className="text-sm text-green-500">{message}</span>}
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            תמונות ({images.length}/10)
          </label>
          
          <div className="grid grid-cols-5 gap-2 mb-3">
            {images.map((img, index) => {
              const url = getImageUrl(img);
              return (
                <div key={index} className="relative aspect-square bg-gray-100 rounded overflow-hidden group">
                  {url && <img src={url} alt="" className="w-full h-full object-cover" />}
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    ✕
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-wdi-gold text-white text-xs px-1 rounded">
                      ראשית
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          
          {images.length < 10 && (
            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="images-upload"
              />
              <label
                htmlFor="images-upload"
                className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm inline-block"
              >
                {uploading ? 'מעלה...' : '+ העלה תמונות'}
              </label>
              <span className="text-xs text-gray-500 mr-2">
                ניתן לבחור מספר תמונות
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם הפרויקט</label>
          <input
            type="text"
            value={project.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">לקוח</label>
          <input
            type="text"
            value={project.client || ''}
            onChange={(e) => updateField('client', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
          <select
            value={project.category || ''}
            onChange={(e) => updateField('category', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שנה</label>
            <input
              type="number"
              value={project.year || ''}
              onChange={(e) => updateField('year', parseInt(e.target.value) || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סדר תצוגה</label>
            <input
              type="number"
              value={project.order || 0}
              onChange={(e) => updateField('order', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={project.featured || false}
              onChange={(e) => updateField('featured', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">מומלץ (מוצג בעמוד הראשי)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={project.isActive !== false}
              onChange={(e) => updateField('isActive', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">פעיל</span>
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
