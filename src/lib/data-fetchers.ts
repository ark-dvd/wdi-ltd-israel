/**
 * Server-side data fetcher functions — DOC-070
 * Internal TypeScript functions for Next.js SSR.
 * List fetchers return [] on error. Single-entity fetchers return null.
 *
 * GROQ coalesce() handles field name migration:
 *   coalesce(name, title) — returns `name` if set, otherwise `title`
 *   coalesce(pageTitle, headline, formTitle) — new→old field migration
 */
import { sanityClient } from './sanity/client';

// ─── Services ───────────────────────────────────────────────

export async function getActiveServices() {
  try {
    return await sanityClient.fetch(
      `*[_type == "service" && isActive != false] | order(order asc){
        _id, "name": coalesce(name, title), "slug": slug.current,
        "description": coalesce(description, shortDescription), tagline, icon,
        highlights, detailContent, image, order, ctaText, howWdiDoesIt
      }`,
    );
  } catch (err) {
    console.error('[ssr]', err);
    return [];
  }
}

export async function getService(slug: string) {
  try {
    return await sanityClient.fetch(
      `*[_type == "service" && slug.current == $slug && isActive != false][0]{
        ...,
        "name": coalesce(name, title),
        "slug": slug.current,
        "description": coalesce(description, shortDescription)
      }`,
      { slug },
    );
  } catch (err) {
    console.error('[ssr]', err);
    return null;
  }
}

// ─── Projects ───────────────────────────────────────────────

export async function getActiveProjects() {
  try {
    return await sanityClient.fetch(
      `*[_type == "project" && isActive != false] | order(order asc){
        _id, title, "slug": slug.current, client,
        "sector": coalesce(sector, category), description, scope, location,
        images, featuredImage, "isFeatured": coalesce(isFeatured, featured),
        startDate, completedAt, year, order
      }`,
    );
  } catch (err) {
    console.error('[ssr]', err);
    return [];
  }
}

export async function getActiveProjectsBySector(sector: string) {
  try {
    return await sanityClient.fetch(
      `*[_type == "project" && isActive != false && (sector == $sector || category == $sector)] | order(order asc){
        _id, title, "slug": slug.current, client,
        "sector": coalesce(sector, category), featuredImage,
        "isFeatured": coalesce(isFeatured, featured), order
      }`,
      { sector },
    );
  } catch (err) {
    console.error('[ssr]', err);
    return [];
  }
}

export async function getProject(slug: string) {
  try {
    return await sanityClient.fetch(
      `*[_type == "project" && slug.current == $slug && isActive != false][0]{
        ...,
        "sector": coalesce(sector, category),
        "isFeatured": coalesce(isFeatured, featured),
        "linkedTestimonials": *[_type == "testimonial" && projectRef._ref == ^._id && isActive == true] | order(order asc){
          _id, clientName, quote, companyName, role, isFeatured, image, order
        }
      }`,
      { slug },
    );
  } catch (err) {
    console.error('[ssr]', err);
    return null;
  }
}

// ─── Team Members ───────────────────────────────────────────

export async function getTeamMembers() {
  try {
    return await sanityClient.fetch(
      `*[_type == "teamMember" && isActive != false] | order(
        select(
          category == "founders" => 0,
          category == "management" => 1,
          category == "department-heads" => 2,
          category == "project-managers" => 3,
          4
        ) asc, order asc
      ){
        _id, name, role, category, image, bio, qualifications,
        birthYear, residence, degrees, linkedin, email, phone, order
      }`,
    );
  } catch (err) {
    console.error('[ssr]', err);
    return [];
  }
}

export async function getTeamMembersByCategory(category: string) {
  try {
    return await sanityClient.fetch(
      `*[_type == "teamMember" && isActive != false && category == $category] | order(order asc){
        _id, name, role, category, image, bio, qualifications,
        birthYear, residence, degrees, linkedin, email, phone, order
      }`,
      { category },
    );
  } catch (err) {
    console.error('[ssr]', err);
    return [];
  }
}

// ─── Client Content ─────────────────────────────────────────

export async function getActiveClientsContent() {
  try {
    return await sanityClient.fetch(
      `*[_type == "clientContent" && isActive != false] | order(order asc){
        _id, name, logo, websiteUrl, order
      }`,
    );
  } catch (err) {
    console.error('[ssr]', err);
    return [];
  }
}

// ─── Testimonials ───────────────────────────────────────────

export async function getFeaturedTestimonials() {
  try {
    return await sanityClient.fetch(
      `*[_type == "testimonial" && isFeatured == true && isActive != false] | order(order asc){
        _id, clientName, quote, companyName, role, image, "projectTitle": projectRef->title
      }`,
    );
  } catch (err) {
    console.error('[ssr]', err);
    return [];
  }
}

export async function getActiveTestimonials() {
  try {
    return await sanityClient.fetch(
      `*[_type == "testimonial" && isActive != false] | order(order asc){
        _id, clientName, quote, companyName, role, image, isFeatured, "projectTitle": projectRef->title
      }`,
    );
  } catch (err) {
    console.error('[ssr]', err);
    return [];
  }
}

// ─── Press ──────────────────────────────────────────────────

export async function getActivePressItems() {
  try {
    return await sanityClient.fetch(
      `*[_type == "pressItem" && isActive != false] | order(publishDate desc){
        _id, title, source, publishDate, excerpt, externalUrl, image, order
      }`,
    );
  } catch (err) {
    console.error('[ssr]', err);
    return [];
  }
}

// ─── Jobs ───────────────────────────────────────────────────

export async function getActiveJobs() {
  try {
    return await sanityClient.fetch(
      `*[_type == "job" && isActive != false] | order(order asc){
        _id, title, description, requirements, location, type, department, contactEmail, order
      }`,
    );
  } catch (err) {
    console.error('[ssr]', err);
    return [];
  }
}

// ─── Content Library ────────────────────────────────────────

export async function getActiveContentLibraryItems() {
  try {
    return await sanityClient.fetch(
      `*[_type == "contentLibraryItem" && isActive != false] | order(order asc){
        _id, title, description, category, icon,
        "fileDownloadUrl": file.asset->url,
        fileUrl, externalUrl, image, order
      }`,
    );
  } catch (err) {
    console.error('[ssr]', err);
    return [];
  }
}

// ─── Singletons ─────────────────────────────────────────────

export async function getHeroSettings() {
  try {
    return await sanityClient.fetch(
      `*[_type == "heroSettings"][0]{
        ...,
        "videoFileUrl": coalesce(videoFile.asset->url, videoUrl.asset->url)
      }`,
    );
  } catch (err) {
    console.error('[ssr]', err);
    return null;
  }
}

export async function getSiteSettings() {
  try {
    return await sanityClient.fetch(
      `*[_type == "siteSettings"][0]{
        ...,
        "logoWhiteUrl": logoWhite.asset->url,
        "logoDarkUrl": logoDark.asset->url,
        "daflashLogoUrl": daflashLogo.asset->url,
        "duns100ImageUrl": duns100Image.asset->url
      }`,
    );
  } catch (err) {
    console.error('[ssr]', err);
    return null;
  }
}

export async function getAboutPage() {
  try {
    return await sanityClient.fetch(
      `*[_type == "aboutPage"][0]{
        ...,
        "pageTitle": coalesce(pageTitle, ""),
        "companyDescription": coalesce(companyDescription, storyContent),
      }`,
    );
  } catch (err) {
    console.error('[ssr]', err);
    return null;
  }
}

export async function getSupplierFormSettings() {
  try {
    return await sanityClient.fetch(
      `*[_type == "supplierFormSettings"][0]{
        ...,
        "pageTitle": coalesce(pageTitle, formTitle),
      }`,
    );
  } catch (err) {
    console.error('[ssr]', err);
    return null;
  }
}

// ─── Page Singletons (per-page config) ──────────────────────

export async function getServicesPage() {
  try { return await sanityClient.fetch(`*[_type == "servicesPage"][0]`); }
  catch (err) { console.error('[ssr]', err); return null; }
}

export async function getProjectsPage() {
  try { return await sanityClient.fetch(`*[_type == "projectsPage"][0]`); }
  catch (err) { console.error('[ssr]', err); return null; }
}

export async function getTeamPage() {
  try { return await sanityClient.fetch(`*[_type == "teamPage"][0]`); }
  catch (err) { console.error('[ssr]', err); return null; }
}

export async function getClientsPage() {
  try { return await sanityClient.fetch(`*[_type == "clientsPage"][0]`); }
  catch (err) { console.error('[ssr]', err); return null; }
}

export async function getPressPage() {
  try { return await sanityClient.fetch(`*[_type == "pressPage"][0]`); }
  catch (err) { console.error('[ssr]', err); return null; }
}

export async function getJobsPage() {
  try { return await sanityClient.fetch(`*[_type == "jobsPage"][0]`); }
  catch (err) { console.error('[ssr]', err); return null; }
}

export async function getContentLibraryPage() {
  try { return await sanityClient.fetch(`*[_type == "contentLibraryPage"][0]`); }
  catch (err) { console.error('[ssr]', err); return null; }
}

export async function getContactPage() {
  try { return await sanityClient.fetch(`*[_type == "contactPage"][0]`); }
  catch (err) { console.error('[ssr]', err); return null; }
}

export async function getInnovationPage() {
  try {
    return await sanityClient.fetch(
      `*[_type == "innovationPage"][0]{
        ...,
        "pageTitle": coalesce(pageTitle, headline),
        "content": coalesce(content, []),
      }`,
    );
  } catch (err) {
    console.error('[ssr]', err);
    return null;
  }
}
