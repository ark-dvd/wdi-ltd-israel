'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const categoryOptions = [
  { value: 'management', label: 'הנהלה' },
  { value: 'administration', label: 'אדמיניסטרציה' },
  { value: 'department-heads', label: 'ראשי תחומים' },
  { value: 'project-managers', label: 'מנהלי פרויקטים' },
];

export default function TeamEditPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/team/${params.id}`)
      .then(res => res.json())
      .then(data => setMember(data))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/team/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
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
    if (!confirm('האם למחוק את חבר הצוות?')) return;
    try {
      await fetch(`/api/team/${params.id}`, { method: 'DELETE' });
      router.push('/team');
    } catch (error) {
      setMessage('שגיאה במחיקה');
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docId', params.id);
    formData.append('fieldName', 'image');
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.image) {
        setMember(prev => ({ ...prev, image: data.image }));
        setMessage('תמונה הועלתה בהצלחה! ✓');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('שגיאה בהעלאת תמונה');
    } finally {
      setUploading(false);
    }
  }

  function updateField(field, value) {
    setMember(prev => ({ ...prev, [field]: value }));
  }

  function updateEducation(index, field, value) {
    const newEducation = [...(member.education || [])];
    newEducation[index] = { ...newEducation[index], [field]: value };
    updateField('education', newEducation);
  }

  function addEducation() {
    updateField('education', [...(member.education || []), { degree: '', institution: '', year: '' }]);
  }

  function removeEducation(index) {
    updateField('education', member.education.filter((_, i) => i !== index));
  }

  function getImageUrl(image) {
    // Support both old Sanity format and new simple path format
    if (!image) return null;
    if (typeof image === 'string') return image; // Simple path like /images/team/photo.png
    if (image?.asset?._ref) {
      // Legacy Sanity format
      const ref = image.asset._ref;
      const [, id, dimensions, format] = ref.split('-');
      return `https://cdn.sanity.io/images/hrkxr0r8/production/${id}-${dimensions}.${format}`;
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

  if (!member) {
    return <div className="text-center py-12">חבר צוות לא נמצא</div>;
  }

  const imageUrl = getImageUrl(member.image);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/team" className="text-gray-500 hover:text-wdi-blue">← חזרה</Link>
          <h1 className="text-2xl font-bold text-wdi-blue">{member.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className="text-sm text-green-500">{message}</span>}
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">תמונה</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-gray-400">👤</span>
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
                className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                {uploading ? 'מעלה...' : (imageUrl ? 'החלף תמונה' : 'העלה תמונה')}
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם</label>
          <input
            type="text"
            value={member.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תפקיד</label>
          <input
            type="text"
            value={member.role || ''}
            onChange={(e) => updateField('role', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
          <select
            value={member.category || ''}
            onChange={(e) => updateField('category', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שנת לידה</label>
            <input
              type="number"
              value={member.birthYear || ''}
              onChange={(e) => updateField('birthYear', parseInt(e.target.value) || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מקום לידה</label>
            <input
              type="text"
              value={member.birthPlace || ''}
              onChange={(e) => updateField('birthPlace', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">מקום מגורים</label>
          <input
            type="text"
            value={member.residence || ''}
            onChange={(e) => updateField('residence', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Education */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">השכלה</label>
            <button onClick={addEducation} className="text-sm text-wdi-gold hover:underline">
              + הוסף תואר
            </button>
          </div>
          {(member.education || []).map((edu, index) => (
            <div key={index} className="flex gap-2 mb-2 items-start">
              <input
                type="text"
                placeholder="תואר"
                value={edu.degree || ''}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                placeholder="מוסד"
                value={edu.institution || ''}
                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="number"
                placeholder="שנה"
                value={edu.year || ''}
                onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value) || '')}
                className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <button
                onClick={() => removeEducation(index)}
                className="text-red-400 hover:text-red-600 px-2"
              >
                ✕
              </button>
            </div>
          ))}
          {(!member.education || member.education.length === 0) && (
            <p className="text-gray-400 text-sm">לא הוזנה השכלה</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
          <input
            type="url"
            value={member.linkedin || ''}
            onChange={(e) => updateField('linkedin', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            dir="ltr"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={member.isActive !== false}
              onChange={(e) => updateField('isActive', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">פעיל</span>
          </label>
          <div>
            <label className="text-sm text-gray-700 ml-2">סדר:</label>
            <input
              type="number"
              value={member.order || 0}
              onChange={(e) => updateField('order', parseInt(e.target.value))}
              className="w-20 px-2 py-1 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleDelete} className="text-red-500 hover:text-red-700 text-sm">
          🗑️ מחק חבר צוות
        </button>
      </div>
    </div>
  );
}
