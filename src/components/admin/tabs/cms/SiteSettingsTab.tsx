'use client';

/**
 * Site Settings singleton — DOC-030 §11.10
 * Covers ALL global strings: nav labels, page strings, form labels,
 * footer text, CTA defaults, sector/job-type labels, SEO, branding.
 */
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Plus, Trash2, ChevronDown } from 'lucide-react';
import { apiGet, apiPut, type ErrorEnvelope } from '@/lib/api/client';
import { useRequestLifecycle } from '@/hooks/useRequestLifecycle';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useToast } from '../../Toast';
import { ErrorRenderer } from '../../ErrorRenderer';

type StringMap = Record<string, string>;
interface SiteSettings {
  _id: string;
  companyName?: string; companyNameEn?: string; companyDescription?: string;
  phone?: string; email?: string; address?: string;
  copyrightText?: string; websiteByText?: string; footerText?: string;
  footerCompanyLabel?: string; footerServicesLabel?: string;
  footerContactLabel?: string; footerLeaveDetailsText?: string;
  socialLinks?: { linkedin?: string; facebook?: string; instagram?: string; youtube?: string };
  contactFormSubjects?: string[];
  formLabels?: StringMap;
  googleMapsEmbed?: string;
  defaultCtaTitle?: string; defaultCtaSubtitle?: string;
  defaultCtaButtonText?: string; defaultCtaButtonLink?: string;
  navLabels?: StringMap;
  footerNavLabels?: StringMap;
  seoTitle?: string; seoDescription?: string; seoKeywords?: string;
  updatedAt: string;
}

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-wdi-primary focus:ring-1 focus:ring-wdi-primary';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>{children}</div>;
}

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-right">
        <h2 className="font-semibold text-gray-800">{title}</h2>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-6 pb-6 space-y-4">{children}</div>}
    </div>
  );
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

  // Setters
  const set = (key: string, val: unknown) => { setForm(p => ({ ...p, [key]: val })); setDirty(true); };
  const setSocial = (key: string, val: string) => { setForm(p => ({ ...p, socialLinks: { ...p.socialLinks, [key]: val } })); setDirty(true); };
  const setFormLabel = (key: string, val: string) => { setForm(p => ({ ...p, formLabels: { ...p.formLabels, [key]: val } })); setDirty(true); };
  const setNav = (key: string, val: string) => { setForm(p => ({ ...p, navLabels: { ...p.navLabels, [key]: val } })); setDirty(true); };
  const setFooterNav = (key: string, val: string) => { setForm(p => ({ ...p, footerNavLabels: { ...p.footerNavLabels, [key]: val } })); setDirty(true); };
  // Array helpers for contactFormSubjects
  const addSubject = () => set('contactFormSubjects', [...(form.contactFormSubjects || []), '']);
  const updateSubject = (i: number, v: string) => { const a = [...(form.contactFormSubjects || [])]; a[i] = v; set('contactFormSubjects', a); };
  const removeSubject = (i: number) => set('contactFormSubjects', (form.contactFormSubjects || []).filter((_, idx) => idx !== i));

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

      <div className="space-y-4">
        {/* ── Company Info ── */}
        <Section title="פרטי חברה" defaultOpen>
          <Field label="שם חברה"><input type="text" value={form.companyName ?? ''} onChange={e => set('companyName', e.target.value)} className={inputCls} /></Field>
          <Field label="שם חברה (אנגלית)"><input type="text" value={form.companyNameEn ?? ''} onChange={e => set('companyNameEn', e.target.value)} className={inputCls} dir="ltr" /></Field>
          <Field label="תיאור החברה"><textarea value={form.companyDescription ?? ''} onChange={e => set('companyDescription', e.target.value)} rows={2} className={inputCls} /></Field>
          <Field label="טלפון"><input type="tel" value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} className={inputCls} dir="ltr" /></Field>
          <Field label="אימייל"><input type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} className={inputCls} dir="ltr" /></Field>
          <Field label="כתובת"><textarea value={form.address ?? ''} onChange={e => set('address', e.target.value)} rows={2} className={inputCls} /></Field>
        </Section>

        {/* ── Footer Text ── */}
        <Section title="טקסטים בפוטר">
          <Field label="זכויות יוצרים"><input type="text" value={form.copyrightText ?? ''} onChange={e => set('copyrightText', e.target.value)} className={inputCls} /></Field>
          <Field label="טקסט &quot;עוצב ע&quot;י&quot;"><input type="text" value={form.websiteByText ?? ''} onChange={e => set('websiteByText', e.target.value)} className={inputCls} /></Field>
          <Field label="כותרת עמודת החברה"><input type="text" value={form.footerCompanyLabel ?? ''} onChange={e => set('footerCompanyLabel', e.target.value)} className={inputCls} /></Field>
          <Field label="כותרת עמודת שירותים"><input type="text" value={form.footerServicesLabel ?? ''} onChange={e => set('footerServicesLabel', e.target.value)} className={inputCls} /></Field>
          <Field label="כותרת עמודת צור קשר"><input type="text" value={form.footerContactLabel ?? ''} onChange={e => set('footerContactLabel', e.target.value)} className={inputCls} /></Field>
          <Field label="טקסט &quot;השאר פרטים&quot;"><input type="text" value={form.footerLeaveDetailsText ?? ''} onChange={e => set('footerLeaveDetailsText', e.target.value)} className={inputCls} /></Field>
          <Field label="תוכן תחתית (ישן)"><textarea value={form.footerText ?? ''} onChange={e => set('footerText', e.target.value)} rows={2} className={inputCls} /></Field>
        </Section>

        {/* ── Social Links ── */}
        <Section title="רשתות חברתיות">
          <Field label="LinkedIn"><input type="url" value={form.socialLinks?.linkedin ?? ''} onChange={e => setSocial('linkedin', e.target.value)} className={inputCls} dir="ltr" /></Field>
          <Field label="Facebook"><input type="url" value={form.socialLinks?.facebook ?? ''} onChange={e => setSocial('facebook', e.target.value)} className={inputCls} dir="ltr" /></Field>
          <Field label="Instagram"><input type="url" value={form.socialLinks?.instagram ?? ''} onChange={e => setSocial('instagram', e.target.value)} className={inputCls} dir="ltr" /></Field>
          <Field label="YouTube"><input type="url" value={form.socialLinks?.youtube ?? ''} onChange={e => setSocial('youtube', e.target.value)} className={inputCls} dir="ltr" /></Field>
        </Section>

        {/* ── Contact Form Labels ── */}
        <Section title="תוויות טופס צור קשר">
          {([
            ['nameLabel', 'שם מלא'], ['emailLabel', 'אימייל'], ['phoneLabel', 'טלפון'], ['companyLabel', 'חברה'],
            ['subjectLabel', 'נושא'], ['messageLabel', 'הודעה'], ['submitText', 'טקסט שליחה'], ['submittingText', 'טקסט בזמן שליחה'],
            ['successTitle', 'כותרת הצלחה'], ['successMessage', 'הודעת הצלחה'], ['errorMessage', 'הודעת שגיאה'], ['sendAgainText', 'שלח שוב'],
          ] as const).map(([key, label]) => (
            <Field key={key} label={label}><input type="text" value={form.formLabels?.[key] ?? ''} onChange={e => setFormLabel(key, e.target.value)} className={inputCls} /></Field>
          ))}
        </Section>

        {/* ── Contact Form Subjects ── */}
        <Section title="נושאים בטופס צור קשר">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">רשימת נושאים לדרופדאון</span>
            <button onClick={addSubject} className="text-sm text-wdi-primary hover:underline flex items-center gap-1" type="button"><Plus size={14} />הוסף</button>
          </div>
          {(form.contactFormSubjects || []).map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={s} onChange={e => updateSubject(i, e.target.value)} className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm" />
              <button onClick={() => removeSubject(i)} className="p-1 text-red-400 hover:text-red-600" type="button"><Trash2 size={14} /></button>
            </div>
          ))}
        </Section>

        {/* ── Google Maps ── */}
        <Section title="מפת Google">
          <Field label="קוד הטמעת iframe"><textarea value={form.googleMapsEmbed ?? ''} onChange={e => set('googleMapsEmbed', e.target.value)} rows={3} className={inputCls} dir="ltr" /></Field>
        </Section>

        {/* ── Default CTA ── */}
        <Section title="CTA ברירת מחדל">
          <Field label="כותרת"><input type="text" value={form.defaultCtaTitle ?? ''} onChange={e => set('defaultCtaTitle', e.target.value)} className={inputCls} /></Field>
          <Field label="תת-כותרת"><input type="text" value={form.defaultCtaSubtitle ?? ''} onChange={e => set('defaultCtaSubtitle', e.target.value)} className={inputCls} /></Field>
          <Field label="טקסט כפתור"><input type="text" value={form.defaultCtaButtonText ?? ''} onChange={e => set('defaultCtaButtonText', e.target.value)} className={inputCls} /></Field>
          <Field label="קישור כפתור"><input type="text" value={form.defaultCtaButtonLink ?? ''} onChange={e => set('defaultCtaButtonLink', e.target.value)} className={inputCls} dir="ltr" /></Field>
        </Section>

        {/* ── Navigation Labels ── */}
        <Section title="תוויות ניווט (תפריט עליון)">
          {([
            ['about', 'אודות'], ['services', 'שירותים'], ['projects', 'פרויקטים'],
            ['innovation', 'חדשנות'], ['contentLibrary', 'מאגר מידע'], ['contact', 'צור קשר'],
            ['aboutCompany', 'אודות החברה'], ['ourTeam', 'הצוות שלנו'], ['pressAboutUs', 'כתבו עלינו'],
            ['clients', 'לקוחות'], ['allServices', 'כל השירותים'], ['contactForm', 'השאר פרטים'],
            ['supplierReg', 'הצטרפות למאגר'], ['jobs', 'משרות'],
          ] as [string, string][]).map(([key, label]) => (
            <Field key={key} label={label}><input type="text" value={form.navLabels?.[key] ?? ''} onChange={e => setNav(key, e.target.value)} className={inputCls} /></Field>
          ))}
        </Section>

        {/* ── Footer Nav Labels ── */}
        <Section title="תוויות ניווט בפוטר">
          {([['about', 'אודות'], ['team', 'הצוות'], ['clients', 'לקוחות'], ['projects', 'פרויקטים']] as [string, string][]).map(([key, label]) => (
            <Field key={key} label={label}><input type="text" value={form.footerNavLabels?.[key] ?? ''} onChange={e => setFooterNav(key, e.target.value)} className={inputCls} /></Field>
          ))}
        </Section>

        {/* ── SEO ── */}
        <Section title="SEO">
          <Field label="כותרת SEO"><input type="text" value={form.seoTitle ?? ''} onChange={e => set('seoTitle', e.target.value)} className={inputCls} /></Field>
          <Field label="תיאור SEO"><textarea value={form.seoDescription ?? ''} onChange={e => set('seoDescription', e.target.value)} rows={2} className={inputCls} /></Field>
          <Field label="מילות מפתח"><input type="text" value={form.seoKeywords ?? ''} onChange={e => set('seoKeywords', e.target.value)} className={inputCls} /></Field>
        </Section>
      </div>
    </div>
  );
}
