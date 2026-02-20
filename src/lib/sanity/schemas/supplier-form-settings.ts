/**
 * SupplierFormSettings (Content Entity — Singleton) — DOC-070 §3.15
 * Stores configuration for the supplier registration form.
 * INV-P01: All visible text from CMS.
 */

export const SUPPLIER_FORM_SETTINGS_ID = 'supplierFormSettings';

export const supplierFormSettingsSchema = {
  name: 'supplierFormSettings',
  title: 'הגדרות טופס ספקים',
  type: 'document' as const,
  fields: [
    { name: 'pageTitle', title: 'כותרת העמוד', type: 'string' as const },
    { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
    // Keep old field for migration
    { name: 'formTitle', title: 'כותרת (ישן)', type: 'string' as const, hidden: true },
    {
      name: 'content',
      title: 'תוכן מבוא',
      type: 'array' as const,
      of: [{ type: 'block' as const }],
    },
    {
      name: 'specialtyOptions',
      title: 'תחומי התמחות',
      type: 'array' as const,
      of: [{ type: 'string' as const }],
    },
    {
      name: 'regionOptions',
      title: 'אזורים',
      type: 'array' as const,
      of: [{ type: 'string' as const }],
    },
    // Sidebar content
    { name: 'sidebarTitle', title: 'כותרת צד', type: 'string' as const },
    {
      name: 'sidebarItems',
      title: 'פריטי צד',
      type: 'array' as const,
      of: [{
        type: 'object' as const,
        fields: [
          { name: 'icon', title: 'אייקון', type: 'string' as const },
          { name: 'text', title: 'טקסט', type: 'string' as const },
        ],
      }],
    },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
