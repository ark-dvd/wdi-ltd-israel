/**
 * GitHub API Client for WDI Back Office
 * Replaces Sanity - stores data as JSON files in the repository
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'ark-dvd';
const REPO_NAME = 'wdi-ltd-israel';
const BRANCH = 'main';

const BASE_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

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

/**
 * Upload image to repository
 */
export async function uploadImage(file, folder = 'images') {
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
