'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Consistent categories - MUST match page.js and new/page.js
const TEAM_CATEGORIES = [
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
    fetchMember();
  }, [params.id]);

  async function fetchMember() {
    try {
      const res = await fetch(`/api/team/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setMember(data);
      } else {
        setMessage('חבר צוות לא נמצא');
      }
    } catch (error) {
      console.error('Error fetching member:', error);
      setMessage('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!member.name || !member.role) {
      setMessage('שם ותפקיד הם שדות חובה');
      return;
    }

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
        setMessage(`שגיאה: ${error.error || 'שגיאה בשמירה'}`);
      }
    } catch (error) {
      setMessage('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('האם אתה בטוח שברצונך למחוק את חבר הצוות?')) return;
    
    try {
      const res = await fetch(`/api/team/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/team');
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
    
    // Validate file
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
    formData.append('folder', 'images/team');
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.image) {
        setMember(prev => ({ ...prev, image: data.image }));
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

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">חבר צוות לא נמצא</p>
        <Link href="/team" className="text-wdi-blue hover:text-wdi-gold">חזרה לרשימה</Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(member.image);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/team" className="text-gray-400 hover:text-gray-600">
            → חזרה לרשימה
          </Link>
          <h1 className="text-2xl font-bold text-wdi-blue">עריכת {member.name}</h1>
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
          <h2 className="font-semibold text-wdi-blue mb-4">תמונה</h2>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-4xl text-gray-300 overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                '👤'
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
          <h2 className="font-semibold text-wdi-blue mb-4">פרטים בסיסיים</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא *</label>
              <input
                type="text"
                value={member.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תפקיד *</label>
              <input
                type="text"
                value={member.role || ''}
                onChange={(e) => updateField('role', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
              <select
                value={member.category || 'project-managers'}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              >
                {TEAM_CATEGORIES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מגדר</label>
              <select
                value={member.gender || 'male'}
                onChange={(e) => updateField('gender', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              >
                <option value="male">זכר</option>
                <option value="female">נקבה</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שנת לידה</label>
              <input
                type="number"
                value={member.birthYear || ''}
                onChange={(e) => updateField('birthYear', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
                min="1950"
                max="2010"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מקום לידה</label>
              <input
                type="text"
                value={member.birthPlace || ''}
                onChange={(e) => updateField('birthPlace', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מקום מגורים</label>
              <input
                type="text"
                value={member.residence || ''}
                onChange={(e) => updateField('residence', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                type="url"
                value={member.linkedin || ''}
                onChange={(e) => updateField('linkedin', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
                dir="ltr"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סדר תצוגה</label>
              <input
                type="number"
                value={member.order || 100}
                onChange={(e) => updateField('order', parseInt(e.target.value) || 100)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-wdi-blue">השכלה</h2>
            <button
              onClick={addDegree}
              className="text-sm text-wdi-blue hover:text-wdi-gold"
            >
              + הוסף תואר
            </button>
          </div>
          
          {(member.degrees || []).map((edu, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-600">תואר {index + 1}</span>
                <button
                  onClick={() => removeDegree(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  הסר
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">סוג תואר</label>
                  <select
                    value={edu.degree || ''}
                    onChange={(e) => updateDegree(index, 'degree', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">בחר סוג</option>
                    <option value="B.Sc">B.Sc - תואר ראשון</option>
                    <option value="B.A">B.A - תואר ראשון</option>
                    <option value="M.Sc">M.Sc - תואר שני</option>
                    <option value="M.A">M.A - תואר שני</option>
                    <option value="MBA">MBA</option>
                    <option value="Ph.D">Ph.D - דוקטורט</option>
                    <option value="הנדסאי">הנדסאי</option>
                    <option value="טכנאי">טכנאי</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">שם התואר</label>
                  <input
                    type="text"
                    value={edu.title || ''}
                    onChange={(e) => updateDegree(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="הנדסה אזרחית"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">מוסד לימודים</label>
                  <input
                    type="text"
                    value={edu.institution || ''}
                    onChange={(e) => updateDegree(index, 'institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="הטכניון"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">שנת סיום</label>
                  <input
                    type="number"
                    value={edu.year || ''}
                    onChange={(e) => updateDegree(index, 'year', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min="1970"
                    max="2030"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {(!member.degrees || member.degrees.length === 0) && (
            <p className="text-gray-400 text-sm">לא הוזנו תארים</p>
          )}
        </div>
      </div>
    </div>
  );
}
