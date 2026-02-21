/** ContentLibraryPage singleton — DOC-070 §3.9 */

export const CONTENT_LIBRARY_PAGE_ID = 'contentLibraryPage';

export const contentLibraryPageSchema = {
  name: 'contentLibraryPage',
  title: 'עמוד מאגר מידע',
  type: 'document' as const,
  fields: [
    { name: 'pageTitle', title: 'כותרת העמוד', type: 'string' as const },
    { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
    { name: 'emptyText', title: 'טקסט כשאין תוכן', type: 'string' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
