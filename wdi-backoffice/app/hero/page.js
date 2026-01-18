'use client';

import { useState, useEffect } from 'react';

export default function HeroPage() {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/hero')
      .then(res => res.json())
      .then(data => setHero(data || {
        title: '',
        subtitle: '',
        ctaText: '',
        ctaLink: '',
      }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hero),
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

  async function handleVideoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setMessage('הקובץ גדול מדי (מקסימום 50MB)');
      return;
    }
    
    setUploading(true);
    setMessage('מעלה וידאו... זה עשוי לקחת זמן');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'video');
    
    try {
      const res = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setHero(prev => ({ ...prev, videoUrl: data.url, videoAssetId: data.assetId }));
        setMessage('וידאו הועלה בהצלחה! ✓');
        
        // Auto-save
        await fetch('/api/hero', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...hero, videoUrl: data.url, videoAssetId: data.assetId }),
        });
      }
    } catch (error) {
      setMessage('שגיאה בהעלאת וידאו');
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  }

  function updateField(field, value) {
    setHero(prev => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wdi-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-wdi-blue">עמוד ראשי - Hero</h1>
          <p className="text-gray-500 text-sm mt-1">עריכת הכותרת והוידאו בעמוד הראשי</p>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className="text-sm text-green-500">{message}</span>}
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Video Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-wdi-blue mb-4">וידאו רקע</h2>
          
          <div className="mb-4">
            {hero?.videoUrl ? (
              <div className="relative">
                <video 
                  src={hero.videoUrl} 
                  className="w-full rounded-lg" 
                  controls
                  muted
                  loop
                />
                <p className="text-xs text-gray-500 mt-2">הוידאו רץ בלופ ללא קול בעמוד הראשי</p>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">אין וידאו</span>
              </div>
            )}
          </div>
          
          <div>
            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg"
              onChange={handleVideoUpload}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className={`cursor-pointer px-4 py-2 rounded-lg text-sm inline-block ${
                uploading 
                  ? 'bg-gray-200 text-gray-500' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {uploading ? 'מעלה...' : (hero?.videoUrl ? 'החלף וידאו' : 'העלה וידאו')}
            </label>
            <span className="text-xs text-gray-500 mr-2">MP4, WebM או OGG (עד 50MB)</span>
          </div>
        </div>

        {/* Text Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-wdi-blue mb-4">טקסטים</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">כותרת ראשית</label>
              <input
                type="text"
                value={hero?.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="לדוגמה: WDI - ניהול פרויקטים מקצועי"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תת-כותרת / מסר</label>
              <textarea
                value={hero?.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="המסר שמופיע מתחת לכותרת"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טקסט כפתור CTA</label>
                <input
                  type="text"
                  value={hero?.ctaText || ''}
                  onChange={(e) => updateField('ctaText', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="לדוגמה: צרו קשר"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">קישור CTA</label>
                <input
                  type="text"
                  value={hero?.ctaLink || ''}
                  onChange={(e) => updateField('ctaLink', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  dir="ltr"
                  placeholder="#contact או /contact"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview hint */}
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
          💡 לאחר השמירה, השינויים יופיעו בעמוד הראשי של האתר
        </div>
      </div>
    </div>
  );
}
