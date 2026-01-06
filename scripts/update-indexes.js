#!/usr/bin/env node
/**
 * Auto-update _index.json files for all data folders
 * This script runs during Netlify build to sync CMS content
 */

const fs = require('fs');
const path = require('path');

const DATA_FOLDERS = [
  'data/team',
  'data/projects', 
  'data/clients-items',
  'data/testimonials',
  'data/jobs',
  'data/content-library'
];

function updateIndex(folderPath) {
  const fullPath = path.join(process.cwd(), folderPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Folder not found: ${folderPath}`);
    return;
  }
  
  // Get all JSON files except _index.json
  const files = fs.readdirSync(fullPath)
    .filter(file => file.endsWith('.json') && file !== '_index.json')
    .sort();
  
  const indexData = { files };
  const indexPath = path.join(fullPath, '_index.json');
  
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  console.log(`Updated ${folderPath}/_index.json with ${files.length} files`);
}

console.log('=== Updating _index.json files ===');
DATA_FOLDERS.forEach(updateIndex);
console.log('=== Done ===');
