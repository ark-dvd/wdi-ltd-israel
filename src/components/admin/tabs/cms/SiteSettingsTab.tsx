'use client';

/**
 * Site Settings singleton — DOC-030 §11.10
 */
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiGet, apiPut, type ErrorEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useToast } from '../../Toast';
import { ErrorRenderer } from '../../ErrorRenderer';

interface SiteSettings {
  _id: string; companyName?: string; phone?: string; email?: string; address?: string;
  footerText?: string; socialLinks?: { linkedin?: string; facebook?: string; instagram?: string };
  seoTitle?: string; seoDescription?: string; seoKeywords?: string; updatedAt: string;
}

export function SiteSettingsTab() {
  const [data, setData] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<ErrorEnvelope | null>(null);
  const [form, setForm] = useState<Partial<SiteSettings>>({});
  const [dirty, setDirty] = useState(false);
  const { error: mutErr, isLocked, execute, reset } = useRequestLifecycle();
  const { addToast } = useToast();
  useUnsavedChanges(dirty);

  const fetchData = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try {
      const r = await apiGet<SiteSettings>('/api/admin/site-settings');
      setData(r.data); setForm(r.data); setDirty(false);
    } catch (e) { setFetchErr(e as ErrorEnvelope); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const r = await execute(async () => apiPut<SiteSettings>('/api/admin/site-settings', { ...form, updatedAt: data?.updatedAt }));
    if (r) { const d = (r as { data: SiteSettings }).data; setData(d); setForm(d); setDirty(false); addToast('הגדרות אתר נשמרו', 'success'); }
  };

  const set = (key: string, val: string) => { setForm((p) => ({ ...p, [key]: val })); setDirty(true); };
  const setSocial = (key: string, val: string) => {
    setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: val } })); setDirty(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">טוען הגדרות אתר...</div>;
  if (fetchErr) return <div className="p-8"><ErrorRenderer error={fetchErr} onReload={fetchData} /></div>;

  return (
    <div className="p-6 max-w-2xl" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">הגדרות אתר</h1>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600" type="button"><RefreshCw size={18} /></button>
          <button onClick={handleSave} disabled={isLocked || !dirty} className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50" type="button">
            {isLocked ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>

      <ErrorRenderer error={mutErr} onReload={fetchData} onDismiss={reset} />

      <div className="space-y-6">
        {/* General */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">פרטי חברה</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">שם חברה</label><input type="text" value={form.companyName ?? ''} onChange={(e) => set('companyName', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label><input type="tel" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" dir="ltr" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label><input type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" dir="ltr" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כתובת</label><textarea value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תוכן תחתית</label><textarea value={form.footerText ?? ''} onChange={(e) => set('footerText', e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">קישורי רשתות חברתיות</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label><input type="url" value={form.socialLinks?.linkedin ?? ''} onChange={(e) => setSocial('linkedin', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" dir="ltr" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label><input type="url" value={form.socialLinks?.facebook ?? ''} onChange={(e) => setSocial('facebook', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" dir="ltr" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label><input type="url" value={form.socialLinks?.instagram ?? ''} onChange={(e) => setSocial('instagram', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" dir="ltr" /></div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">SEO</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת SEO</label><input type="text" value={form.seoTitle ?? ''} onChange={(e) => set('seoTitle', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תיאור SEO</label><textarea value={form.seoDescription ?? ''} onChange={(e) => set('seoDescription', e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">מילות מפתח</label><input type="text" value={form.seoKeywords ?? ''} onChange={(e) => set('seoKeywords', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary" /></div>
        </div>
      </div>
    </div>
  );
}
