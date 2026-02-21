/** ClientsPage singleton — DOC-070 §3.6 */

export const CLIENTS_PAGE_ID = 'clientsPage';

export const clientsPageSchema = {
  name: 'clientsPage',
  title: 'עמוד לקוחות',
  type: 'document' as const,
  fields: [
    { name: 'pageTitle', title: 'כותרת העמוד', type: 'string' as const },
    { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
    { name: 'testimonialsTitle', title: 'כותרת המלצות', type: 'string' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
