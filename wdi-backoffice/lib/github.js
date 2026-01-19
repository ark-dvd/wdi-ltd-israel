/**
 * GitHub API Client for WDI Back Office
 * Stores data as JSON files in the repository
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'ark-dvd';
const REPO_NAME = 'wdi-ltd-israel';
const BRANCH = 'main';

const BASE_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
const RAW_BASE_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;
const SITE_URL = 'https://wdi.co.il';

// ==========================================
// GITHUB API HELPERS
// ==========================================

async function githubFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error(`GitHub API Error: ${response.status}`, error);
    throw new Error(error.message || `GitHub API error: ${response.status}`);
  }

  return response.json();
}

async function getFile(path) {
  try {
    const data = await githubFetch(`/contents/${path}?ref=${BRANCH}`);
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return { content: JSON.parse(content), sha: data.sha, path: data.path };
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return null;
    }
    throw error;
  }
}

async function listDirectory(path) {
  try {
    const data = await githubFetch(`/contents/${path}?ref=${BRANCH}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return [];
    }
    throw error;
  }
}

async function saveFile(path, content, message, sha = null) {
  const body = {
    message: message || `Update ${path}`,
    content: Buffer.from(JSON.stringify(content, null, 2), 'utf8').toString('base64'),
    branch: BRANCH,
  };
  
  if (sha) {
    body.sha = sha;
  }

  return githubFetch(`/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

async function deleteFile(path, sha, message) {
  return githubFetch(`/contents/${path}`, {
    method: 'DELETE',
    body: JSON.stringify({
      message: message || `Delete ${path}`,
      sha,
      branch: BRANCH,
    }),
  });
}

// ==========================================
// DATA PATHS
// ==========================================

const PATHS = {
  team: 'data/team',
  projects: 'data/projects',
  services: 'data/services',
  clients: 'data/clients-items',
  testimonials: 'data/testimonials',
  jobs: 'data/jobs',
  'content-library': 'data/content-library',
  press: 'data/press',
  hero: 'data/hero',
};

// ==========================================
// IMAGE URL HELPERS
// ==========================================

/**
 * Convert repository path to displayable URL
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // Already a full URL
  if (imagePath.startsWith('http')) return imagePath;
  
  // Repository path like /images/team/photo.jpg
  if (imagePath.startsWith('/')) {
    return `${SITE_URL}${imagePath}`;
  }
  
  return `${SITE_URL}/${imagePath}`;
}

/**
 * Get raw GitHub URL for newly uploaded images (before deploy)
 */
export function getRawImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${RAW_BASE_URL}/${cleanPath}`;
}

// ==========================================
// CRUD OPERATIONS
// ==========================================

/**
 * Fetch all items of a type
 */
export async function fetchAll(type) {
  const basePath = PATHS[type];
  if (!basePath) throw new Error(`Unknown type: ${type}`);

  const files = await listDirectory(basePath);
  const items = [];

  for (const file of files) {
    if (file.name.endsWith('.json') && !file.name.startsWith('_')) {
      const result = await getFile(file.path);
      if (result && result.content) {
        items.push({
          ...result.content,
          _id: file.name.replace('.json', ''),
          _path: file.path,
          _sha: result.sha,
        });
      }
    }
  }

  // Sort by order field if exists
  return items.sort((a, b) => (a.order || 999) - (b.order || 999));
}

/**
 * Fetch single item by ID
 */
export async function fetchOne(type, id) {
  const basePath = PATHS[type];
  if (!basePath) throw new Error(`Unknown type: ${type}`);

  const filePath = `${basePath}/${id}.json`;
  const result = await getFile(filePath);
  
  if (!result) return null;
  
  return {
    ...result.content,
    _id: id,
    _path: result.path,
    _sha: result.sha,
  };
}

/**
 * Create new item
 */
export async function createItem(type, data) {
  const basePath = PATHS[type];
  if (!basePath) throw new Error(`Unknown type: ${type}`);

  // Generate ID from name/title or use provided id
  const id = data.id || generateSlug(data.name || data.title) || generateId();
  const filePath = `${basePath}/${id}.json`;
  
  // Check if file already exists
  const existing = await getFile(filePath);
  if (existing) {
    throw new Error(`Item with ID "${id}" already exists`);
  }

  // Clean internal fields
  const { _id, _path, _sha, ...cleanData } = data;
  const itemData = { ...cleanData, id };

  await saveFile(filePath, itemData, `Create ${type}: ${id}`);
  
  return { ...itemData, _id: id, _path: filePath };
}

/**
 * Update existing item
 */
export async function updateItem(type, id, data) {
  const basePath = PATHS[type];
  if (!basePath) throw new Error(`Unknown type: ${type}`);

  const filePath = `${basePath}/${id}.json`;
  const existing = await getFile(filePath);
  
  if (!existing) {
    throw new Error(`Item "${id}" not found`);
  }

  // Clean internal fields and merge with existing
  const { _id, _path, _sha, ...cleanData } = data;
  const itemData = { ...existing.content, ...cleanData, id };

  await saveFile(filePath, itemData, `Update ${type}: ${id}`, existing.sha);
  
  return { ...itemData, _id: id, _path: filePath };
}

/**
 * Delete item
 */
export async function deleteItem(type, id) {
  const basePath = PATHS[type];
  if (!basePath) throw new Error(`Unknown type: ${type}`);

  const filePath = `${basePath}/${id}.json`;
  const existing = await getFile(filePath);
  
  if (!existing) {
    throw new Error(`Item "${id}" not found`);
  }

  await deleteFile(filePath, existing.sha, `Delete ${type}: ${id}`);
  
  return { success: true, id };
}

// ==========================================
// HELPERS
// ==========================================

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateSlug(text) {
  if (!text) return null;
  
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0590-\u05FF-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

// ==========================================
// IMAGE HANDLING
// ==========================================

// Allowed folders for upload
const ALLOWED_UPLOAD_FOLDERS = ['images', 'images/team', 'images/projects', 'images/clients', 'images/press', 'videos'];

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// Max file sizes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB

/**
 * Validate upload request
 */
export function validateUpload(file, folder, isVideo = false) {
  const errors = [];
  
  // Check folder
  if (!ALLOWED_UPLOAD_FOLDERS.includes(folder)) {
    errors.push(`Folder "${folder}" is not allowed`);
  }
  
  // Check file type
  const allowedTypes = isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type "${file.type}" is not allowed`);
  }
  
  // Check file size
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }
  
  return errors;
}

/**
 * Upload image to repository
 */
export async function uploadImage(file, folder = 'images') {
  // Validate
  const errors = validateUpload(file, folder, false);
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
  const filePath = `${folder}/${fileName}`;
  
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  
  await githubFetch(`/contents/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `Upload image: ${fileName}`,
      content: base64,
      branch: BRANCH,
    }),
  });
  
  return `/${filePath}`;
}

/**
 * Upload video to repository
 */
export async function uploadVideo(file, folder = 'videos') {
  // Validate
  const errors = validateUpload(file, folder, true);
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
  const filePath = `${folder}/${fileName}`;
  
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  
  await githubFetch(`/contents/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `Upload video: ${fileName}`,
      content: base64,
      branch: BRANCH,
    }),
  });
  
  return `/${filePath}`;
}
