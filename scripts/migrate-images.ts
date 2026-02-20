/**
 * Image Migration Script — uploads local images to Sanity CDN and patches documents.
 *
 * Prerequisites:
 *   1. Set SANITY_API_TOKEN in .env.local (needs write access)
 *   2. Run: npx tsx scripts/migrate-images.ts
 *
 * Options:
 *   --dry-run   Show what would be uploaded without making changes
 *   --only=team|clients|press   Run only a specific category
 */
import { createClient } from '@sanity/client';
import * as fs from 'fs';
import * as path from 'path';

// ── Load env from .env.local ────────────────────────────────
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'hrkxr0r8';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
const TOKEN = process.env.SANITY_API_TOKEN;

const DRY_RUN = process.argv.includes('--dry-run');
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1];

if (!TOKEN && !DRY_RUN) {
  console.error('ERROR: SANITY_API_TOKEN is not set in .env.local');
  console.error('Generate a token at: https://www.sanity.io/manage/project/hrkxr0r8/api#tokens');
  console.error('Tip: use --dry-run to preview without a token');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2026-02-19',
  useCdn: false,
  token: TOKEN,
});

const ROOT = path.resolve(__dirname, '..');

// ── Type definitions ────────────────────────────────────────

interface ImageMapping {
  documentId: string;
  field: string; // 'image' | 'logo' | 'featuredImage'
  filePath: string; // relative to project root
  label: string; // for logging
}

// ── Team member mappings ────────────────────────────────────
// Sanity document ID → local file path

const TEAM_MAPPINGS: ImageMapping[] = [
  // From data/team.json (12 members with real photos)
  { documentId: '0f68b4a0-1a89-432e-8977-102cf242e4a8', field: 'image', filePath: 'images/team/arik-davidi.jpg', label: 'אריק דוידי' },
  { documentId: '84ed5c5f-73bd-427b-8344-605ca39c27bb', field: 'image', filePath: 'images/team/guy-golan.jpg', label: 'גיא גולן' },
  { documentId: '306eb54c-011d-4087-895c-21f978c7396e', field: 'image', filePath: 'images/team/ilan-weiss.jpg', label: 'אילן וייס' },
  { documentId: 'fcdb3bde-1a67-4103-befd-9b7cbb1f7ab9', field: 'image', filePath: 'images/team/yarden-weiss.jpg', label: 'ירדן וייס' },
  { documentId: '30c153bf-1004-4ef9-abcf-309cb99e51f6', field: 'image', filePath: 'images/team/eyal-nir.jpg', label: 'איל ניר' },
  { documentId: 'cc9749e3-f113-465a-9dde-47c31c7cb2d6', field: 'image', filePath: 'images/team/yossi-elisha.jpg', label: 'יוסי אלישע' },
  { documentId: '74240b7e-fead-4703-bb96-187058fdde97', field: 'image', filePath: 'images/team/victor-lifshitz.jpg', label: 'ויקטור ליפשיץ' },
  { documentId: '73d06f17-ce24-4d29-983e-8c4ad2922151', field: 'image', filePath: 'images/team/rotem-glick.jpg', label: 'רותם גליק' },
  { documentId: 'ace74614-7d40-489b-9b3d-86810102c31f', field: 'image', filePath: 'images/team/ori-davidi.jpg', label: 'אורי דוידי' },
  { documentId: 'f4d992cc-ac32-4108-80d4-3f0ca606cc59', field: 'image', filePath: 'images/team/ido-kuri.jpg', label: 'עידו כורי' },
  { documentId: 'eedb4d65-82bb-4daa-baf1-160ff0a08ad2', field: 'image', filePath: 'images/team/tamir-lederman.jpg', label: 'תמיר לדרמן' },
  { documentId: '027d6798-1702-416f-a0e7-1fd00e75d893', field: 'image', filePath: 'images/team/yonatan-raymond.jpg', label: 'יונתן ריימונד' },
  // Extra members from individual JSON files (AI-generated or recovered photos)
  { documentId: '83563dfd-82d7-40df-816e-5baa93aa84cc', field: 'image', filePath: 'images/team/gemini_generated_image_6qz1xx6qz1xx6qz1.png', label: 'אלי חנה' },
  { documentId: 'c4bfd12f-0c9c-48ce-b22c-02ccc9ad09e6', field: 'image', filePath: 'images/team/gemini_generated_image_mjb0kjmjb0kjmjb0.png', label: 'אנה ליבורקין' },
  { documentId: 'c862ba82-0da7-4322-9674-59c054978aa2', field: 'image', filePath: 'images/team/gemini_generated_image_uyl93wuyl93wuyl9.png', label: 'נאור זנה' },
  { documentId: '5e8eb9b4-8aa5-4fce-81cd-e141dbc6a12c', field: 'image', filePath: 'images/team/gemini_generated_image_27nbwc27nbwc27nb.png', label: 'ענת שפרינגר' },
  { documentId: '0b36c97f-984c-4709-96e1-9cb4514d1c6b', field: 'image', filePath: 'images/team/gemini_generated_image_3urqzx3urqzx3urq.png', label: 'רוני בן נחום' },
  { documentId: 'a709b180-f23b-44d0-804e-2ba853bfdd09', field: 'image', filePath: 'migration/archive/media-recovered/itamar.jpg', label: 'איתמר שפירא' },
  { documentId: '0287d0b2-dda0-40d2-bbe3-119457d25515', field: 'image', filePath: 'migration/archive/media-recovered/li-chen.jpg', label: 'לי-חן קורן' },
  // שי קלרטג — no image file available, skipped
];

// ── Client logo mappings ────────────────────────────────────

const CLIENT_MAPPINGS: ImageMapping[] = [
  { documentId: 'f6d5f990-03f2-4e7d-a2ab-d373cd1811bd', field: 'logo', filePath: 'images/clients/shapir.png', label: 'שפיר' },
  { documentId: '14adf454-e849-4140-a0e3-656d8d046720', field: 'logo', filePath: 'images/clients/electra.jpg', label: 'אלקטרה' },
  { documentId: '7edf427c-eb12-4760-864e-43e08b28c4f3', field: 'logo', filePath: 'images/clients/minrav.jpg', label: 'מנרב' },
  { documentId: 'ce0a0b85-5636-49f9-a10c-72e24a834b43', field: 'logo', filePath: 'images/clients/noble-energy.jpg', label: 'Noble Energy' },
  { documentId: '4b77c051-7dea-4a78-8fa0-33ef63a7535d', field: 'logo', filePath: 'images/clients/pmo.jpg', label: 'משרד ראש הממשלה' },
  { documentId: '5b4bc191-3443-4c1a-9380-ea355a484231', field: 'logo', filePath: 'images/clients/mod.jpg', label: 'משרד הביטחון' },
  { documentId: 'c479be6d-77c6-480d-9af5-87aec52fcfad', field: 'logo', filePath: 'images/clients/idf.jpg', label: 'צה"ל' },
  { documentId: 'b3a9bcdb-e2c0-482f-9157-e3402123ec3f', field: 'logo', filePath: 'images/clients/iaf.jpg', label: 'חיל האוויר' },
  { documentId: 'f11b73ea-516a-4bf6-bd10-7416eed44f44', field: 'logo', filePath: 'images/clients/libeskind.jpg', label: 'Studio Libeskind' },
  { documentId: 'b6eaa253-b803-49c3-b2a3-cb3f000c7649', field: 'logo', filePath: 'images/clients/skorka.jpg', label: 'Skorka' },
  { documentId: '084cd830-2e8d-4691-9921-615a8834b7c8', field: 'logo', filePath: 'images/clients/aurbach-halevy.jpg', label: 'אורבך הלוי' },
  { documentId: '56a5d92a-50e2-4c7b-a68d-e36d1f690259', field: 'logo', filePath: 'images/clients/kimmel.jpg', label: 'קימל אשכולות' },
  { documentId: '83c21489-5822-44f4-8aa3-8e2f95a1bbce', field: 'logo', filePath: 'images/clients/afcon.jpg', label: 'אפקון' },
  { documentId: '22993c73-a4a6-4902-bcbf-6dcfb2fb8b0c', field: 'logo', filePath: 'images/clients/menolid.jpg', label: 'מנולד חירות' },
  { documentId: '583674b4-9247-48d6-ba01-e33294f52810', field: 'logo', filePath: 'images/clients/tahal.jpg', label: 'תה"ל' },
  { documentId: '939f3819-1e05-4098-b3fb-c8d60aefbfbc', field: 'logo', filePath: 'images/clients/tmng.jpg', label: 'TMNG' },
  { documentId: 'fbcd41ee-b497-44d5-88a6-7f9a087241fd', field: 'logo', filePath: 'images/clients/beer-sheva.jpg', label: 'עיריית באר שבע' },
  { documentId: 'e60a1ac1-0902-488b-bf1f-f4c3de020a1f', field: 'logo', filePath: 'images/clients/ide.jpg', label: 'IDE' },
  { documentId: '9400ea32-ebba-49be-bed2-e33f07a9cbaa', field: 'logo', filePath: 'images/clients/pmec.jpg', label: 'PMEC' },
];

// ── Press image mappings ────────────────────────────────────

const PRESS_MAPPINGS: ImageMapping[] = [
  { documentId: '5f044bcc-7ffd-42c2-a504-e28ae36d40b5', field: 'image', filePath: 'images/press/themarker.png', label: 'דה מרקר — הצלחה ישראלית' },
  { documentId: '75cde9c1-3579-4874-9963-938ece1d1e50', field: 'image', filePath: 'images/press/calcalist.png', label: 'כלכליסט — ניהול תכנון כוללני' },
  { documentId: 'cd5c18a8-41f0-485e-a6d9-b54adcd9c169', field: 'image', filePath: 'images/press/calcalist.png', label: 'כלכליסט — תשתית לצמיחה' },
];

// ── Upload + patch logic ────────────────────────────────────

async function uploadAndPatch(mapping: ImageMapping): Promise<boolean> {
  const absPath = path.join(ROOT, mapping.filePath);

  if (!fs.existsSync(absPath)) {
    console.warn(`  SKIP  ${mapping.label} — file not found: ${mapping.filePath}`);
    return false;
  }

  if (DRY_RUN) {
    console.log(`  [DRY] ${mapping.label} ← ${mapping.filePath}`);
    return true;
  }

  try {
    // Upload image to Sanity CDN
    const imageBuffer = fs.readFileSync(absPath);
    const ext = path.extname(absPath).slice(1); // jpg, png, etc.
    const contentType =
      ext === 'jpg' || ext === 'jpeg'
        ? 'image/jpeg'
        : ext === 'png'
          ? 'image/png'
          : ext === 'webp'
            ? 'image/webp'
            : ext === 'svg'
              ? 'image/svg+xml'
              : 'image/jpeg';

    const asset = await client.assets.upload('image', imageBuffer, {
      filename: path.basename(absPath),
      contentType,
    });

    // Patch document with image reference
    await client
      .patch(mapping.documentId)
      .set({
        [mapping.field]: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
        },
      })
      .commit({ autoGenerateArrayKeys: true });

    console.log(`  OK    ${mapping.label} ← ${mapping.filePath} (${asset._id})`);
    return true;
  } catch (err: any) {
    console.error(`  FAIL  ${mapping.label} — ${err.message}`);
    return false;
  }
}

async function runCategory(name: string, mappings: ImageMapping[]) {
  console.log(`\n── ${name} (${mappings.length} images) ──`);
  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const m of mappings) {
    const result = await uploadAndPatch(m);
    if (result) ok++;
    else if (!fs.existsSync(path.join(ROOT, m.filePath))) skip++;
    else fail++;
  }

  console.log(`   ${name} done: ${ok} uploaded, ${skip} skipped, ${fail} failed`);
  return { ok, skip, fail };
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  console.log(`Image Migration — Sanity project ${PROJECT_ID}/${DATASET}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  if (ONLY) console.log(`Category filter: ${ONLY}`);

  const totals = { ok: 0, skip: 0, fail: 0 };

  const categories: { name: string; key: string; mappings: ImageMapping[] }[] = [
    { name: 'Team Members', key: 'team', mappings: TEAM_MAPPINGS },
    { name: 'Client Logos', key: 'clients', mappings: CLIENT_MAPPINGS },
    { name: 'Press Images', key: 'press', mappings: PRESS_MAPPINGS },
  ];

  for (const cat of categories) {
    if (ONLY && cat.key !== ONLY) continue;
    const result = await runCategory(cat.name, cat.mappings);
    totals.ok += result.ok;
    totals.skip += result.skip;
    totals.fail += result.fail;
  }

  console.log(`\n═══ TOTAL: ${totals.ok} uploaded, ${totals.skip} skipped, ${totals.fail} failed ═══`);

  if (totals.fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
