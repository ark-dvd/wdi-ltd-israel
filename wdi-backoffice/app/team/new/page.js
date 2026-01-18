'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const categoryOptions = [
  { value: 'founders', label: 'הנהלה' },
  { value: 'admin', label: 'אדמיניסטרציה' },
  { value: 'heads', label: 'ראשי תחומים' },
  { value: 'team', label: 'מנהלי פרויקטים' },
];

export default function NewTeamMemberPage() {
  const router = useRouter();
  const [member, setMember] = useState({
    name: '',
    position: '',
    category: 'team',
    gender: 'male',
    birthYear: null,
    birthPlace: '',
    residence: '',
    linkedin: '',
    degrees: [],
    order: 100,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave() {
    if (!member.name || !member.position) {
      setMessage('שם ותפקיד הם שדות חובה');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessage('נוצר בהצלחה! ✓');
        setTimeout(() => {
          router.push(`/team/${data._id || data.id}`);
        }, 1000);
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

  function updateField(field, value) {
    setMember(prev => ({ ...prev, [field]: value }));
  }

  function updateEducation(index, field, value) {
    const newDegrees = [...(member.degrees || [])];
    newDegrees[index] = { ...newDegrees[index], [field]: value };
    updateField('degrees', newDegrees);
  }

  function addEducation() {
    updateField('degrees', [...(member.degrees || []), { degree: '', title: '', institution: '', year: '' }]);
  }

  function removeEducation(index) {
    updateField('degrees', member.degrees.filter((_, i) => i !== index));
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/team" className="text-gray-500 hover:text-wdi-blue">← חזרה</Link>
          <h1 className="text-2xl font-bold text-wdi-blue">הוספת חבר צוות חדש</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className={`text-sm ${message.includes('שגיאה') ? 'text-red-500' : 'text-green-500'}`}>{message}</span>}
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? 'שומר...' : 'צור חבר צוות'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם *</label>
          <input
            type="text"
            value={member.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="שם מלא"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תפקיד *</label>
          <input
            type="text"
            value={member.position}
            onChange={(e) => updateField('position', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="תפקיד"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
            <select
              value={member.category}
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
              value={member.gender}
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
              value={member.birthPlace}
              onChange={(e) => updateField('birthPlace', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">מקום מגורים</label>
          <input
            type="text"
            value={member.residence}
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
          {(member.degrees || []).map((edu, index) => (
            <div key={index} className="flex gap-2 mb-2 items-start">
              <input
                type="text"
                placeholder="סוג תואר"
                value={edu.degree || ''}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                placeholder="תחום"
                value={edu.title || ''}
                onChange={(e) => updateEducation(index, 'title', e.target.value)}
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
                type="text"
                placeholder="שנה"
                value={edu.year || ''}
                onChange={(e) => updateEducation(index, 'year', e.target.value)}
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
          <input
            type="url"
            value={member.linkedin}
            onChange={(e) => updateField('linkedin', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            dir="ltr"
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div>
          <label className="text-sm text-gray-700 ml-2">סדר תצוגה:</label>
          <input
            type="number"
            value={member.order}
            onChange={(e) => updateField('order', parseInt(e.target.value))}
            className="w-20 px-2 py-1 border border-gray-300 rounded"
          />
          <span className="text-xs text-gray-500 mr-2">(הנהלה: 1-9, אדמין: 10-19, ראשי תחומים: 20-29, צוות: 100+)</span>
        </div>
      </div>
    </div>
  );
}
