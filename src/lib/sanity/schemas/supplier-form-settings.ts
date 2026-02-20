/**
 * SupplierFormSettings (Content Entity — Singleton)
 * Stores configuration for the supplier registration form.
 */

export const SUPPLIER_FORM_SETTINGS_ID = 'supplierFormSettings';

export const supplierFormSettingsSchema = {
  name: 'supplierFormSettings',
  title: 'הגדרות טופס ספקים',
  type: 'document' as const,
  fields: [
    { name: 'formTitle', title: 'כותרת הטופס', type: 'string' as const },
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
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
