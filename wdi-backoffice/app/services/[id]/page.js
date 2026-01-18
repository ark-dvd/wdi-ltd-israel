'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ServiceEditPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchService();
  }, [params.id]);

  async function fetchService() {
    try {
      const res = await fetch(`/api/services/${params.id}`);
      const data = await res.json();
      setService(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/services/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
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

  function updateField(field, value) {
    setService(prev => ({ ...prev, [field]: value }));
  }

  function updateSection(index, field, value) {
    const newSections = [...(service.sections || [])];
    newSections[index] = { ...newSections[index], [field]: value };
    updateField('sections', newSections);
  }

  function updateSectionItem(sectionIndex, itemIndex, value) {
    const newSections = [...(service.sections || [])];
    const newItems = [...newSections[sectionIndex].items];
    newItems[itemIndex] = value;
    newSections[sectionIndex] = { ...newSections[sectionIndex], items: newItems };
    updateField('sections', newSections);
  }

  function addSection() {
    const newSections = [...(service.sections || []), { title: 'סעיף חדש', items: [''] }];
    updateField('sections', newSections);
  }

  function removeSection(index) {
    const newSections = service.sections.filter((_, i) => i !== index);
    updateField('sections', newSections);
  }

  function addSectionItem(sectionIndex) {
    const newSections = [...service.sections];
    newSections[sectionIndex].items.push('');
    updateField('sections', newSections);
  }

  function removeSectionItem(sectionIndex, itemIndex) {
    const newSections = [...service.sections];
    newSections[sectionIndex].items = newSections[sectionIndex].items.filter((_, i) => i !== itemIndex);
    updateField('sections', newSections);
  }

  function updateWdiMethodItem(index, value) {
    const newItems = [...(service.wdiMethod || [])];
    newItems[index] = value;
    updateField('wdiMethod', newItems);
  }

  function addWdiMethodItem() {
    updateField('wdiMethod', [...(service.wdiMethod || []), '']);
  }

  function removeWdiMethodItem(index) {
    updateField('wdiMethod', service.wdiMethod.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wdi-blue"></div>
      </div>
    );
  }

  if (!service) {
    return <div className="text-center py-12">שירות לא נמצא</div>;
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/services" className="text-gray-500 hover:text-wdi-blue">
            ← חזרה לשירותים
          </Link>
          <h1 className="text-2xl font-bold text-wdi-blue">{service.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-sm ${message.includes('שגיאה') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-gold disabled:opacity-50"
          >
            {saving ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-wdi-blue mb-4">פרטים בסיסיים</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם השירות</label>
            <input
              type="text"
              value={service.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">אייקון (Font Awesome)</label>
            <input
              type="text"
              value={service.icon || ''}
              onChange={(e) => updateField('icon', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="drafting-compass"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">תיאור קצר (לכרטיס)</label>
          <textarea
            value={service.shortDescription || ''}
            onChange={(e) => updateField('shortDescription', e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={service.isActive}
              onChange={(e) => updateField('isActive', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">פעיל</span>
          </label>
          <div>
            <label className="text-sm text-gray-700 ml-2">סדר:</label>
            <input
              type="number"
              value={service.order || 0}
              onChange={(e) => updateField('order', parseInt(e.target.value))}
              className="w-20 px-2 py-1 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Page Intro */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-wdi-blue mb-4">כותרת העמוד</h2>
        <p className="text-sm text-gray-500 mb-4">הטקסט שמופיע בראש העמוד מתחת לשם השירות</p>
        <textarea
          value={service.pageIntro || ''}
          onChange={(e) => updateField('pageIntro', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="תיאור מפורט של השירות שמופיע בכותרת העמוד..."
        />
      </div>

      {/* About Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-wdi-blue mb-4">אודות השירות</h2>
        <p className="text-sm text-gray-500 mb-4">פסקת הפתיחה של העמוד</p>
        <textarea
          value={service.aboutText || ''}
          onChange={(e) => updateField('aboutText', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="טקסט מפורט אודות השירות..."
        />
      </div>

      {/* Sections */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-wdi-blue">סעיפים ופירוט</h2>
            <p className="text-sm text-gray-500">הסעיפים עם רשימות הנקודות</p>
          </div>
          <button onClick={addSection} className="text-wdi-gold hover:underline text-sm">
            + הוסף סעיף
          </button>
        </div>

        {(service.sections || []).map((section, sectionIndex) => (
          <div key={sectionIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-semibold"
                placeholder="כותרת הסעיף"
              />
              <button
                onClick={() => removeSection(sectionIndex)}
                className="text-red-500 hover:text-red-700 mr-2 text-sm"
              >
                🗑️ מחק
              </button>
            </div>

            {(section.items || []).map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center gap-2 mb-2">
                <span className="text-green-500">✓</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateSectionItem(sectionIndex, itemIndex, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm"
                  placeholder="נקודה..."
                />
                <button
                  onClick={() => removeSectionItem(sectionIndex, itemIndex)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button
              onClick={() => addSectionItem(sectionIndex)}
              className="text-sm text-gray-500 hover:text-wdi-gold mt-2"
            >
              + הוסף נקודה
            </button>
          </div>
        ))}
      </div>

      {/* WDI Method */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-wdi-blue">איך WDI עושה את זה?</h2>
            <p className="text-sm text-gray-500">רשימת היתרונות של WDI</p>
          </div>
          <button onClick={addWdiMethodItem} className="text-wdi-gold hover:underline text-sm">
            + הוסף פריט
          </button>
        </div>

        {(service.wdiMethod || []).map((item, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <span className="text-wdi-gold">⭐</span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateWdiMethodItem(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded"
              placeholder="יתרון..."
            />
            <button
              onClick={() => removeWdiMethodItem(index)}
              className="text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-wdi-blue mb-4">קריאה לפעולה (CTA)</h2>
        <p className="text-sm text-gray-500 mb-4">התיבה הכחולה בסיידבר</p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">כותרת</label>
          <input
            type="text"
            value={service.ctaTitle || ''}
            onChange={(e) => updateField('ctaTitle', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="צריכים ניהול תכנון?"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">טקסט</label>
          <textarea
            value={service.ctaText || ''}
            onChange={(e) => updateField('ctaText', e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="רוצים לוודא שהתכנון שלכם בידיים הטובות ביותר?"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? 'שומר...' : 'שמור שינויים'}
        </button>
      </div>
    </div>
  );
}
