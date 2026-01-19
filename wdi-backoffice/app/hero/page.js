'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroPage() {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchHero();
  }, []);

  async function fetchHero() {
    try {
      const res = await fetch('/api/hero');
      const data = await res.json();
      // Hero is stored as hero-settings.json
      if (Array.isArray(data) && data.length > 0) {
        setHero(data[0]);
      } else if (data && !Array.isArray(data)) {
        setHero(data);
      } else {
        // Default values if no hero exists
        setHero({
          title: 'מאתגר להצלחה',
          subtitle: 'חברת בוטיק לניהול פרויקטים, פיקוח וייעוץ הנדסי',
          videoUrl: '/videos/hero-video.mp4',
        });
      }
    } catch (error) {
      console.error('Error fetching hero:', error);
      setHero({
        title: '',
        subtitle: '',
        videoUrl: '',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...hero, id: 'hero-settings' }),
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

  async function handleVideoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate
    if (!file.type.startsWith('video/')) {
      setMessage('יש להעלות קובץ וידאו בלבד (MP4, WebM)');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setMessage('גודל הוידאו חייב להיות עד 25MB. נא לדחוס את הקובץ.');
      return;
    }
    
    setUploading(true);
    setMessage('מעלה וידאו... זה עלול לקחת זמן');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setHero(prev => ({ ...prev, videoUrl: data.url }));
        setMessage('וידאו הועלה! לחץ "שמור" כדי לשמור את השינויים ✓');
      } else {
        setMessage(`שגיאה: ${data.error || 'שגיאה בהעלאה'}`);
      }
    } catch (error) {
      setMessage('שגיאה בהעלאת וידאו');
    } finally {
      setUploading(false);
    }
  }

  function updateField(field, value) {
    setHero(prev => ({ ...prev, [field]: value }));
  }

  function getVideoUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://wdi.co.il${url.startsWith('/') ? '' : '/'}${url}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wdi-blue"></div>
      </div>
    );
  }

  const videoUrl = getVideoUrl(hero?.videoUrl);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-wdi-blue">עמוד ראשי - Hero</h1>
        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-sm ${message.includes('✓') ? 'text-green-500' : 'text-red-500'}`}>
              {message}
            </span>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Preview */}
        <div className="bg-wdi-blue rounded-xl overflow-hidden">
          <div className="relative h-64">
            {videoUrl && (
              <video
                src={videoUrl}
                className="absolute inset-0 w-full h-full object-cover opacity-50"
                autoPlay
                loop
                muted
                playsInline
              />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
              <h2 className="text-3xl font-bold mb-2">{hero?.title || 'כותרת'}</h2>
              <p className="text-lg opacity-90">{hero?.subtitle || 'תת-כותרת'}</p>
            </div>
          </div>
          <div className="bg-black/20 p-2 text-center text-white/70 text-sm">
            תצוגה מקדימה
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-wdi-blue mb-4">טקסטים</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">כותרת ראשית</label>
              <input
                type="text"
                value={hero?.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
                placeholder="מאתגר להצלחה"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תת-כותרת</label>
              <input
                type="text"
                value={hero?.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wdi-blue focus:border-transparent"
                placeholder="חברת בוטיק לניהול פרויקטים..."
              />
            </div>
          </div>
        </div>

        {/* Video */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-wdi-blue mb-4">וידאו רקע</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
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
                  uploading ? 'bg-gray-200 text-gray-500' : 'bg-wdi-blue text-white hover:bg-wdi-blue/90'
                }`}
              >
                {uploading ? 'מעלה...' : 'החלף וידאו'}
              </label>
              <span className="text-sm text-gray-500">MP4, WebM - עד 25MB</span>
            </div>
            
            {hero?.videoUrl && (
              <div className="text-sm text-gray-600">
                <strong>וידאו נוכחי:</strong> {hero.videoUrl}
              </div>
            )}
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>💡 טיפ:</strong> לדחיסת וידאו השתמש ב-
                <a href="https://handbrake.fr/" target="_blank" rel="noopener" className="underline hover:no-underline mx-1">HandBrake</a>
                או
                <a href="https://www.freeconvert.com/video-compressor" target="_blank" rel="noopener" className="underline hover:no-underline mx-1">FreeConvert</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
