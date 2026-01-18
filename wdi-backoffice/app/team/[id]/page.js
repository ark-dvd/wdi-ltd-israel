'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const categoryOptions = [
  { value: 'founders', label: 'הנהלה' },
  { value: 'admin', label: 'אדמיניסטרציה' },
  { value: 'heads', label: 'ראשי תחומים' },
  { value: 'team', label: 'מנהלי פרויקטים' },
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
    setMessage('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'images/team');
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.image) {
        setMember(prev => ({ ...prev, image: data.image }));
        setMessage('תמונה הועלתה! לחץ שמור כדי לשמור');
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
    setMember(prev => ({ ...prev, [field]: value }));
  }

  function updateDegree(index, field, value) {
    const newDegrees = [...(member.degrees || [])];
    newDegrees[index] = { ...newDegrees[index], [field]: value };
    updateField('degrees', newDegrees);
  }

  function addDegree() {
    updateField('degrees', [...(member.degrees || []), { degree: '', title: '', institution: '', year: '' }]);
  }

  function removeDegree(index) {
    updateField('degrees', member.degrees.filter((_, i) => i !== index));
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
          {message && <span className={`text-sm ${message.includes('שגיאה') ? 'text-red-500' : 'text-green-500'}`}>{message}</span>}
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
                <span className="text-3xl text-gray-400">{member.name?.charAt(0) || '👤'}</span>
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
            value={member.position || ''}
            onChange={(e) => updateField('position', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
            <select
              value={member.category || 'team'}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מגדר</label>
            <select
              value={member.gender || 'male'}
              onChange={(e) => updateField('gender', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="male">זכר</option>
              <option value="female">נקבה</option>
            </select>
          </div>
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

        {/* Education - using degrees field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">השכלה</label>
            <button onClick={addDegree} className="text-sm text-wdi-gold hover:underline">
              + הוסף תואר
            </button>
          </div>
          {(member.degrees || []).map((edu, index) => (
            <div key={index} className="flex gap-2 mb-2 items-start">
              <input
                type="text"
                placeholder="סוג תואר"
                value={edu.degree || ''}
                onChange={(e) => updateDegree(index, 'degree', e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                placeholder="תחום"
                value={edu.title || ''}
                onChange={(e) => updateDegree(index, 'title', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                placeholder="מוסד"
                value={edu.institution || ''}
                onChange={(e) => updateDegree(index, 'institution', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                placeholder="שנה"
                value={edu.year || ''}
                onChange={(e) => updateDegree(index, 'year', e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <button
                onClick={() => removeDegree(index)}
                className="text-red-400 hover:text-red-600 px-2"
              >
                ✕
              </button>
            </div>
          ))}
          {(!member.degrees || member.degrees.length === 0) && (
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
            placeholder="https://linkedin.com/in/..."
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
          <span className="text-xs text-gray-500">(הנהלה: 1-9, אדמין: 10-19, ראשי תחומים: 20-29, צוות: 100+)</span>
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
