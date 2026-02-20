'use client';

/**
 * Supplier Form Settings singleton — DOC-030 §11.12
 * Page title, subtitle, sidebar items, specialty/region options.
 */
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Plus, Trash2 } from 'lucide-react';
import { apiGet, apiPut, type ErrorEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useToast } from '../../Toast';
import { ErrorRenderer } from '../../ErrorRenderer';

interface SidebarItem { _key?: string; icon: string; text: string }
interface SupplierFormSettings {
  _id: string;
  pageTitle?: string; subtitle?: string; formTitle?: string;
  sidebarTitle?: string; sidebarItems?: SidebarItem[];
  specialtyOptions?: string[]; regionOptions?: string[];
  updatedAt: string;
}

function genKey() { return Math.random().toString(36).slice(2, 10); }
const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary';

export function SupplierFormSettingsTab() {
  const [data, setData] = useState<SupplierFormSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<ErrorEnvelope | null>(null);
  const [form, setForm] = useState<Partial<SupplierFormSettings>>({});
  const [dirty, setDirty] = useState(false);
  const { error: mutErr, isLocked, execute, reset } = useRequestLifecycle();
  const { addToast } = useToast();
  useUnsavedChanges(dirty);

  const fetchData = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try {
      const r = await apiGet<SupplierFormSettings>('/api/admin/supplier-form-settings');
      setData(r.data); setForm(r.data); setDirty(false);
    } catch (e) { setFetchErr(e as ErrorEnvelope); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const r = await execute(async () => apiPut<SupplierFormSettings>('/api/admin/supplier-form-settings', { ...form, updatedAt: data?.updatedAt }));
    if (r) {
      const d = (r as { data: SupplierFormSettings }).data;
      setData(d); setForm(d); setDirty(false);
      addToast('הגדרות טופס ספקים נשמרו', 'success');
    }
  };

  const set = (key: string, val: unknown) => { setForm(p => ({ ...p, [key]: val })); setDirty(true); };

  // String array helpers
  const addItem = (key: 'specialtyOptions' | 'regionOptions') => set(key, [...(form[key] || []), '']);
  const updateItem = (key: 'specialtyOptions' | 'regionOptions', idx: number, val: string) => {
    const arr = [...(form[key] || [])]; arr[idx] = val; set(key, arr);
  };
  const removeItem = (key: 'specialtyOptions' | 'regionOptions', idx: number) => set(key, (form[key] || []).filter((_, i) => i !== idx));

  // Sidebar items helpers
  const addSidebarItem = () => set('sidebarItems', [...(form.sidebarItems || []), { _key: genKey(), icon: '', text: '' }]);
  const updateSidebarItem = (idx: number, field: string, val: string) => {
    const arr = [...(form.sidebarItems || [])]; arr[idx] = { ...arr[idx], [field]: val } as SidebarItem; set('sidebarItems', arr);
  };
  const removeSidebarItem = (idx: number) => set('sidebarItems', (form.sidebarItems || []).filter((_, i) => i !== idx));

  if (loading) return <div className="p-8 text-center text-gray-500">טוען הגדרות טופס ספקים...</div>;
  if (fetchErr) return <div className="p-8"><ErrorRenderer error={fetchErr} onReload={fetchData} /></div>;

  return (
    <div className="p-6 max-w-2xl" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">הגדרות טופס ספקים</h1>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600" type="button"><RefreshCw size={18} /></button>
          <button onClick={handleSave} disabled={isLocked || !dirty} className="rounded-lg bg-wdi-primary px-4 py-2 text-sm font-medium text-white hover:bg-wdi-primary-light transition disabled:opacity-50" type="button">
            {isLocked ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>

      <ErrorRenderer error={mutErr} onReload={fetchData} onDismiss={reset} />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">כותרת עמוד</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת</label>
            <input type="text" value={form.pageTitle ?? form.formTitle ?? ''} onChange={e => set('pageTitle', e.target.value)} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">תת-כותרת</label>
            <input type="text" value={form.subtitle ?? ''} onChange={e => set('subtitle', e.target.value)} className={inputCls} /></div>
        </div>

        {/* Sidebar */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">סיידבר</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת סיידבר</label>
            <input type="text" value={form.sidebarTitle ?? ''} onChange={e => set('sidebarTitle', e.target.value)} className={inputCls} /></div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-gray-500">פריטים</span>
            <button onClick={addSidebarItem} className="text-sm text-wdi-primary hover:underline flex items-center gap-1" type="button"><Plus size={14} />הוסף</button>
          </div>
          {(form.sidebarItems || []).map((item, i) => (
            <div key={item._key || i} className="flex items-center gap-2">
              <input type="text" value={item.icon} onChange={e => updateSidebarItem(i, 'icon', e.target.value)} placeholder="אייקון (fas fa-...)" className="w-40 rounded border border-gray-300 px-2 py-1.5 text-sm" dir="ltr" />
              <input type="text" value={item.text} onChange={e => updateSidebarItem(i, 'text', e.target.value)} placeholder="טקסט" className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm" />
              <button onClick={() => removeSidebarItem(i)} className="p-1 text-red-400 hover:text-red-600" type="button"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* Specialty Options */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">תחומי התמחות</h2>
            <button onClick={() => addItem('specialtyOptions')} className="text-sm text-wdi-primary hover:underline flex items-center gap-1" type="button"><Plus size={14} />הוסף</button>
          </div>
          {(form.specialtyOptions || []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={opt} onChange={e => updateItem('specialtyOptions', i, e.target.value)} className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm" />
              <button onClick={() => removeItem('specialtyOptions', i)} className="p-1 text-red-400 hover:text-red-600" type="button"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* Region Options */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">אזורים</h2>
            <button onClick={() => addItem('regionOptions')} className="text-sm text-wdi-primary hover:underline flex items-center gap-1" type="button"><Plus size={14} />הוסף</button>
          </div>
          {(form.regionOptions || []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={opt} onChange={e => updateItem('regionOptions', i, e.target.value)} className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm" />
              <button onClick={() => removeItem('regionOptions', i)} className="p-1 text-red-400 hover:text-red-600" type="button"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
