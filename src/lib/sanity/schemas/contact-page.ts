/** ContactPage singleton — DOC-070 §3.10 */

export const CONTACT_PAGE_ID = 'contactPage';

export const contactPageSchema = {
  name: 'contactPage',
  title: 'עמוד צור קשר',
  type: 'document' as const,
  fields: [
    { name: 'pageTitle', title: 'כותרת העמוד', type: 'string' as const },
    { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
    { name: 'infoTitle', title: 'כותרת פרטי התקשרות', type: 'string' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
