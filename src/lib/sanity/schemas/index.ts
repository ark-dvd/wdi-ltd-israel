/**
 * All 18 Sanity schema definitions.
 *
 * CRM Entities (5): Lead, ClientCRM, Engagement, Activity, CrmSettings
 * Intake (1): IntakeSubmission (CANONICAL-AMENDMENT-001)
 * Content Entities (13): Service, Project, TeamMember, ClientContent,
 *   Testimonial, PressItem, Job, ContentLibraryItem, HeroSettings, SiteSettings,
 *   AboutPage, InnovationPage, SupplierFormSettings
 */

// CRM Entities
import { leadSchema } from './lead';
import { clientCrmSchema } from './client-crm';
import { engagementSchema } from './engagement';
import { activitySchema } from './activity';
import { crmSettingsSchema } from './crm-settings';

// Intake (AMENDMENT-001)
import { intakeSubmissionSchema } from './intake-submission';

// Content Entities
import { serviceSchema } from './service';
import { projectSchema } from './project';
import { teamMemberSchema } from './team-member';
import { clientContentSchema } from './client-content';
import { testimonialSchema } from './testimonial';
import { pressItemSchema } from './press-item';
import { jobSchema } from './job';
import { contentLibraryItemSchema } from './content-library-item';
import { heroSettingsSchema } from './hero-settings';
import { siteSettingsSchema } from './site-settings';
import { aboutPageSchema } from './about-page';
import { innovationPageSchema } from './innovation-page';
import { supplierFormSettingsSchema } from './supplier-form-settings';

// Re-export everything
export { leadSchema, LEAD_STATUS, LEAD_PRIORITY, LEAD_TRANSITIONS } from './lead';
export type { LeadStatus, LeadPriority } from './lead';

export { clientCrmSchema, CLIENT_CRM_STATUS, CLIENT_CRM_TRANSITIONS, PREFERRED_CONTACT } from './client-crm';
export type { ClientCrmStatus } from './client-crm';

export { engagementSchema, ENGAGEMENT_STATUS, ENGAGEMENT_TRANSITIONS } from './engagement';
export type { EngagementStatus } from './engagement';

export { activitySchema, ACTIVITY_TYPE, ACTIVITY_ENTITY_TYPE } from './activity';
export type { ActivityType, ActivityEntityType } from './activity';

export {
  crmSettingsSchema,
  CRM_SETTINGS_ID,
  DEFAULT_PIPELINE_STAGES,
  DEFAULT_ENGAGEMENT_STATUSES,
  DEFAULT_SERVICE_TYPES,
  DEFAULT_LEAD_SOURCES,
} from './crm-settings';

export { serviceSchema } from './service';
export { projectSchema, PROJECT_SECTOR } from './project';
export type { ProjectSector } from './project';
export { teamMemberSchema, TEAM_CATEGORY } from './team-member';
export type { TeamCategory } from './team-member';
export { clientContentSchema } from './client-content';
export { testimonialSchema } from './testimonial';
export { pressItemSchema } from './press-item';
export { jobSchema } from './job';
export { contentLibraryItemSchema } from './content-library-item';
export { heroSettingsSchema, HERO_SETTINGS_ID } from './hero-settings';
export { siteSettingsSchema, SITE_SETTINGS_ID } from './site-settings';
export { aboutPageSchema, ABOUT_PAGE_ID } from './about-page';
export { innovationPageSchema, INNOVATION_PAGE_ID } from './innovation-page';
export { supplierFormSettingsSchema, SUPPLIER_FORM_SETTINGS_ID } from './supplier-form-settings';

export {
  intakeSubmissionSchema,
  SUBMISSION_TYPE, CONTACT_STATUS, RELEVANCE,
  OUTCOME_GENERAL, OUTCOME_JOB, OUTCOME_SUPPLIER,
  OUTCOME_BY_TYPE, SOURCE, isValidOutcome,
} from './intake-submission';
export type {
  SubmissionType, ContactStatus, Relevance,
  OutcomeGeneral, OutcomeJob, OutcomeSupplier, Source,
} from './intake-submission';

/** All schema objects for Sanity Studio configuration.
 *  CRM schemas (lead, clientCrm, engagement, activity, crmSettings)
 *  are DEFERRED per CANONICAL-AMENDMENT-001 and excluded from allSchemas.
 *  They remain importable for future Phase 2+ work. */
export const allSchemas = [
  intakeSubmissionSchema,
  serviceSchema,
  projectSchema,
  teamMemberSchema,
  clientContentSchema,
  testimonialSchema,
  pressItemSchema,
  jobSchema,
  contentLibraryItemSchema,
  heroSettingsSchema,
  siteSettingsSchema,
  aboutPageSchema,
  innovationPageSchema,
  supplierFormSettingsSchema,
];
