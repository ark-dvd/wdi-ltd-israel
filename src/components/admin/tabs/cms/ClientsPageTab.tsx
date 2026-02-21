'use client';
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiGet, apiPut, type ErrorEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useToast } from '../../Toast';
import { ErrorRenderer } from '../../ErrorRenderer';

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary';

interface PageData {
  _id: string;
  pageTitle: string;
  subtitle: string;
  testimonialsTitle: string;
  updatedAt: string;
}

export function ClientsPageTab() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<ErrorEnvelope | null>(null);
  const [form, setForm] = useState<Partial<PageData>>({});
  const [dirty, setDirty] = useState(false);
  const { error: mutErr, isLocked, execute, reset } = useRequestLifecycle();
  const { addToast } = useToast();
  useUnsavedChanges(dirty);

  const fetchData = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try { const r = await apiGet<PageData>('/api/admin/clients-page'); setData(r.data); setForm(r.data); setDirty(false); }
    catch (e) { setFetchErr(e as ErrorEnvelope); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const r = await execute(async () => apiPut<PageData>('/api/admin/clients-page', { ...form, updatedAt: data?.updatedAt }));
    if (r) { const d = (r as { data: PageData }).data; setData(d); setForm(d); setDirty(false); addToast('עמוד לקוחות נשמר', 'success'); }
  };

  const set = (key: string, val: unknown) => { setForm(p => ({ ...p, [key]: val })); setDirty(true); };

  if (loading) return <div className="p-8 text-center text-gray-500">טוען עמוד לקוחות...</div>;
  if (fetchErr) return <div className="p-8"><ErrorRenderer error={fetchErr} onReload={fetchData} /></div>;

  return (
    <div className="p-6 max-w-2xl" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">עמוד לקוחות</h1>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600" type="button"><RefreshCw size={18} /></button>
          <button onClick={handleSave} disabled={isLocked || !dirty} className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50" type="button">
            {isLocked ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>
      <ErrorRenderer error={mutErr} onReload={fetchData} onDismiss={reset} />
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">כותרות</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת העמוד</label>
            <input type="text" value={form.pageTitle ?? ''} onChange={e => set('pageTitle', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תת כותרת</label>
            <input type="text" value={form.subtitle ?? ''} onChange={e => set('subtitle', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת המלצות</label>
            <input type="text" value={form.testimonialsTitle ?? ''} onChange={e => set('testimonialsTitle', e.target.value)} className={inputCls} /></div>
        </div>
      </div>
    </div>
  );
}
