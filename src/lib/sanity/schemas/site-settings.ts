/**
 * SiteSettings (Content Entity — Singleton) — DOC-070 §6.2
 * INV-014/025: Only one record may exist. Deletion prohibited.
 * Contains ALL global site strings, branding assets, and page-level text.
 * NO hardcoded Hebrew in components — everything comes from here or page singletons.
 */

export const SITE_SETTINGS_ID = 'siteSettings';

export const siteSettingsSchema = {
  name: 'siteSettings',
  title: 'הגדרות אתר',
  type: 'document' as const,
  fields: [
    // ─── Company Info ───
    { name: 'companyName', title: 'שם חברה', type: 'string' as const },
    { name: 'companyNameEn', title: 'שם חברה (אנגלית)', type: 'string' as const },
    { name: 'companyDescription', title: 'תיאור החברה', type: 'text' as const },
    { name: 'phone', title: 'טלפון', type: 'string' as const },
    { name: 'email', title: 'אימייל', type: 'string' as const },
    { name: 'address', title: 'כתובת', type: 'text' as const },

    // ─── Branding / Logos — INV-P02: all from CMS ───
    { name: 'logoWhite', title: 'לוגו לבן (לרקע כהה)', type: 'image' as const },
    { name: 'logoDark', title: 'לוגו כהה (לרקע בהיר)', type: 'image' as const },
    { name: 'daflashLogo', title: 'לוגו daflash', type: 'image' as const },
    { name: 'duns100Image', title: 'תמונת Duns 100', type: 'image' as const },
    { name: 'duns100Url', title: 'קישור Duns 100', type: 'url' as const },

    // ─── Footer ───
    { name: 'footerText', title: 'תוכן תחתית', type: 'text' as const },
    { name: 'copyrightText', title: 'טקסט זכויות יוצרים', type: 'string' as const },
    { name: 'websiteByText', title: 'טקסט "עוצב ע"י"', type: 'string' as const },
    { name: 'footerCompanyLabel', title: 'כותרת עמודת החברה בפוטר', type: 'string' as const },
    { name: 'footerServicesLabel', title: 'כותרת עמודת שירותים בפוטר', type: 'string' as const },
    { name: 'footerContactLabel', title: 'כותרת עמודת צור קשר בפוטר', type: 'string' as const },
    { name: 'footerLeaveDetailsText', title: 'טקסט כפתור "השאר פרטים" בפוטר', type: 'string' as const },

    // ─── Social Links ───
    {
      name: 'socialLinks',
      title: 'קישורי רשתות חברתיות',
      type: 'object' as const,
      fields: [
        { name: 'linkedin', title: 'LinkedIn', type: 'url' as const },
        { name: 'facebook', title: 'Facebook', type: 'url' as const },
        { name: 'instagram', title: 'Instagram', type: 'url' as const },
        { name: 'youtube', title: 'YouTube', type: 'url' as const },
      ],
    },

    // ─── Contact Form ───
    {
      name: 'contactFormSubjects',
      title: 'נושאים בטופס יצירת קשר',
      type: 'array' as const,
      of: [{ type: 'string' as const }],
      description: 'רשימת נושאים לבחירה בדרופדאון בטופס צור קשר',
    },
    {
      name: 'formLabels',
      title: 'תוויות טפסים',
      type: 'object' as const,
      fields: [
        { name: 'nameLabel', title: 'שם מלא', type: 'string' as const },
        { name: 'emailLabel', title: 'אימייל', type: 'string' as const },
        { name: 'phoneLabel', title: 'טלפון', type: 'string' as const },
        { name: 'companyLabel', title: 'חברה', type: 'string' as const },
        { name: 'subjectLabel', title: 'נושא', type: 'string' as const },
        { name: 'messageLabel', title: 'הודעה', type: 'string' as const },
        { name: 'submitText', title: 'טקסט שליחה', type: 'string' as const },
        { name: 'submittingText', title: 'טקסט בזמן שליחה', type: 'string' as const },
        { name: 'successTitle', title: 'כותרת הצלחה', type: 'string' as const },
        { name: 'successMessage', title: 'הודעת הצלחה', type: 'string' as const },
        { name: 'errorMessage', title: 'הודעת שגיאה', type: 'string' as const },
        { name: 'sendAgainText', title: 'טקסט "שלח שוב"', type: 'string' as const },
      ],
    },
    {
      name: 'googleMapsEmbed',
      title: 'קוד הטמעת Google Maps',
      type: 'text' as const,
      description: 'קוד iframe של Google Maps להטמעה בעמוד צור קשר',
    },

    // ─── Global CTA Defaults ───
    { name: 'defaultCtaTitle', title: 'כותרת CTA ברירת מחדל', type: 'string' as const },
    { name: 'defaultCtaSubtitle', title: 'תת-כותרת CTA ברירת מחדל', type: 'string' as const },
    { name: 'defaultCtaButtonText', title: 'טקסט כפתור CTA ברירת מחדל', type: 'string' as const },
    { name: 'defaultCtaButtonLink', title: 'קישור כפתור CTA ברירת מחדל', type: 'string' as const },

    // ─── Page-Level Strings (for pages without singletons) ───
    {
      name: 'pageStrings',
      title: 'טקסטים לעמודים',
      type: 'object' as const,
      fields: [
        {
          name: 'services',
          title: 'עמוד שירותים',
          type: 'object' as const,
          fields: [
            { name: 'pageTitle', title: 'כותרת', type: 'string' as const },
            { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
            { name: 'ctaTitle', title: 'כותרת CTA', type: 'string' as const },
            { name: 'ctaSubtitle', title: 'תת-כותרת CTA', type: 'string' as const },
            { name: 'readMoreText', title: 'טקסט "קרא עוד"', type: 'string' as const },
          ],
        },
        {
          name: 'projects',
          title: 'עמוד פרויקטים',
          type: 'object' as const,
          fields: [
            { name: 'pageTitle', title: 'כותרת', type: 'string' as const },
            { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
            { name: 'ctaTitle', title: 'כותרת CTA', type: 'string' as const },
            { name: 'ctaSubtitle', title: 'תת-כותרת CTA', type: 'string' as const },
          ],
        },
        {
          name: 'team',
          title: 'עמוד צוות',
          type: 'object' as const,
          fields: [
            { name: 'pageTitle', title: 'כותרת', type: 'string' as const },
            { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
            { name: 'ctaTitle', title: 'כותרת CTA', type: 'string' as const },
            { name: 'ctaSubtitle', title: 'תת-כותרת CTA', type: 'string' as const },
            { name: 'ctaButtonText', title: 'טקסט כפתור CTA', type: 'string' as const },
          ],
        },
        {
          name: 'clients',
          title: 'עמוד לקוחות',
          type: 'object' as const,
          fields: [
            { name: 'pageTitle', title: 'כותרת', type: 'string' as const },
            { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
            { name: 'testimonialsTitle', title: 'כותרת המלצות', type: 'string' as const },
          ],
        },
        {
          name: 'press',
          title: 'עמוד כתבו עלינו',
          type: 'object' as const,
          fields: [
            { name: 'pageTitle', title: 'כותרת', type: 'string' as const },
            { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
          ],
        },
        {
          name: 'jobs',
          title: 'עמוד משרות',
          type: 'object' as const,
          fields: [
            { name: 'pageTitle', title: 'כותרת', type: 'string' as const },
            { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
            { name: 'noJobsTitle', title: 'כותרת "אין משרות"', type: 'string' as const },
            { name: 'noJobsSubtitle', title: 'תת-כותרת "אין משרות"', type: 'string' as const },
            { name: 'ctaTitle', title: 'כותרת CTA', type: 'string' as const },
            { name: 'ctaSubtitle', title: 'תת-כותרת CTA', type: 'string' as const },
            { name: 'applyButtonText', title: 'טקסט כפתור הגשת מועמדות', type: 'string' as const },
            { name: 'sendCvText', title: 'טקסט "שלח CV"', type: 'string' as const },
          ],
        },
        {
          name: 'contentLibrary',
          title: 'עמוד מאגר מידע',
          type: 'object' as const,
          fields: [
            { name: 'pageTitle', title: 'כותרת', type: 'string' as const },
            { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
            { name: 'emptyText', title: 'טקסט ריק', type: 'string' as const },
          ],
        },
        {
          name: 'contact',
          title: 'עמוד צור קשר',
          type: 'object' as const,
          fields: [
            { name: 'pageTitle', title: 'כותרת', type: 'string' as const },
            { name: 'subtitle', title: 'תת-כותרת', type: 'string' as const },
            { name: 'infoTitle', title: 'כותרת פרטי התקשרות', type: 'string' as const },
          ],
        },
      ],
    },

    // ─── Label Maps (CMS-editable display labels for enum values) ───
    {
      name: 'sectorLabels',
      title: 'תוויות מגזרים',
      type: 'array' as const,
      of: [{
        type: 'object' as const,
        fields: [
          { name: 'value', title: 'מזהה', type: 'string' as const },
          { name: 'label', title: 'תווית', type: 'string' as const },
        ],
      }],
    },
    {
      name: 'jobTypeLabels',
      title: 'תוויות סוגי משרה',
      type: 'array' as const,
      of: [{
        type: 'object' as const,
        fields: [
          { name: 'value', title: 'מזהה', type: 'string' as const },
          { name: 'label', title: 'תווית', type: 'string' as const },
        ],
      }],
    },

    // ─── Navigation Labels ───
    {
      name: 'navLabels',
      title: 'תוויות ניווט',
      type: 'object' as const,
      description: 'שמות הקטגוריות בתפריט הניווט',
      fields: [
        { name: 'about', title: 'אודות', type: 'string' as const },
        { name: 'services', title: 'שירותים', type: 'string' as const },
        { name: 'projects', title: 'פרויקטים', type: 'string' as const },
        { name: 'innovation', title: 'חדשנות', type: 'string' as const },
        { name: 'contentLibrary', title: 'מאגר מידע', type: 'string' as const },
        { name: 'contact', title: 'צור קשר', type: 'string' as const },
        { name: 'aboutCompany', title: 'אודות החברה', type: 'string' as const },
        { name: 'ourTeam', title: 'הצוות שלנו', type: 'string' as const },
        { name: 'pressAboutUs', title: 'כתבו עלינו', type: 'string' as const },
        { name: 'clients', title: 'לקוחות', type: 'string' as const },
        { name: 'allServices', title: 'כל השירותים', type: 'string' as const },
        { name: 'contactForm', title: 'השאר פרטים', type: 'string' as const },
        { name: 'supplierReg', title: 'הצטרפות למאגר', type: 'string' as const },
        { name: 'jobs', title: 'משרות', type: 'string' as const },
      ],
    },

    // ─── Footer Navigation Labels ───
    {
      name: 'footerNavLabels',
      title: 'תוויות ניווט בפוטר',
      type: 'object' as const,
      fields: [
        { name: 'about', title: 'אודות', type: 'string' as const },
        { name: 'team', title: 'הצוות', type: 'string' as const },
        { name: 'clients', title: 'לקוחות', type: 'string' as const },
        { name: 'projects', title: 'פרויקטים', type: 'string' as const },
      ],
    },

    // ─── SEO ───
    { name: 'seoTitle', title: 'כותרת SEO', type: 'string' as const },
    { name: 'seoDescription', title: 'תיאור SEO', type: 'text' as const },
    { name: 'seoKeywords', title: 'מילות מפתח', type: 'string' as const },
    { name: 'ogImage', title: 'תמונת שיתוף', type: 'image' as const },
    { name: 'createdAt', title: 'נוצר בתאריך', type: 'datetime' as const, readOnly: true },
    { name: 'updatedAt', title: 'עודכן בתאריך', type: 'datetime' as const, readOnly: true },
  ],
};
