/**
 * GitHub API Client for WDI Back Office
 * With automatic _index.json management
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'ark-dvd';
const REPO_NAME = 'wdi-ltd-israel';
const BRANCH = 'main';
const BASE_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

// Data paths
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
// _index.json Management
// ==========================================

async function updateIndex(type) {
  const basePath = PATHS[type];
  if (!basePath) return;

  const indexPath = `${basePath}/_index.json`;
  
  // List all JSON files in directory
  const files = await listDirectory(basePath);
  const jsonFiles = files
    .filter(f => f.name.endsWith('.json') && !f.name.startsWith('_'))
    .map(f => f.name)
    .sort();

  // Get existing _index.json if exists
  const existing = await getFile(indexPath);
  
  const indexContent = {
    files: jsonFiles,
    updated: new Date().toISOString()
  };

  await saveFile(
    indexPath, 
    indexContent, 
    `Update ${type} index`, 
    existing?.sha
  );
}

// ==========================================
// CRUD Operations
// ==========================================

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

  return items.sort((a, b) => (a.order || 999) - (b.order || 999));
}

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

export async function createItem(type, data) {
  const basePath = PATHS[type];
  if (!basePath) throw new Error(`Unknown type: ${type}`);

  const id = data.id || generateSlug(data.name || data.title) || generateId();
  const filePath = `${basePath}/${id}.json`;
  
  const existing = await getFile(filePath);
  if (existing) {
    throw new Error(`Item with ID "${id}" already exists`);
  }

  const { _id, _path, _sha, ...cleanData } = data;
  const itemData = { ...cleanData, id };

  await saveFile(filePath, itemData, `Create ${type}: ${id}`);
  
  // Update _index.json
  await updateIndex(type);
  
  return { ...itemData, _id: id, _path: filePath };
}

export async function updateItem(type, id, data) {
  const basePath = PATHS[type];
  if (!basePath) throw new Error(`Unknown type: ${type}`);

  const filePath = `${basePath}/${id}.json`;
  const existing = await getFile(filePath);
  
  if (!existing) {
    throw new Error(`Item "${id}" not found`);
  }

  const { _id, _path, _sha, ...cleanData } = data;
  const itemData = { ...existing.content, ...cleanData, id };

  await saveFile(filePath, itemData, `Update ${type}: ${id}`, existing.sha);
  
  // No need to update _index.json for updates (file list unchanged)
  
  return { ...itemData, _id: id, _path: filePath };
}

export async function deleteItem(type, id) {
  const basePath = PATHS[type];
  if (!basePath) throw new Error(`Unknown type: ${type}`);

  const filePath = `${basePath}/${id}.json`;
  const existing = await getFile(filePath);
  
  if (!existing) {
    throw new Error(`Item "${id}" not found`);
  }

  await deleteFile(filePath, existing.sha, `Delete ${type}: ${id}`);
  
  // Update _index.json
  await updateIndex(type);
  
  return { success: true, id };
}

// ==========================================
// Upload functions
// ==========================================

export async function uploadImage(file, folder = 'images') {
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
  const filePath = `${folder}/${fileName}`;
  
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  
  await githubFetch(`/contents/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `Upload: ${fileName}`,
      content: base64,
      branch: BRANCH,
    }),
  });
  
  return `/${filePath}`;
}

export async function uploadVideo(file, folder = 'videos') {
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

// ==========================================
// Helpers
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
    .substring(0, 50);
}
