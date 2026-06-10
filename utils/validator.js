const fs = require('fs-extra')
const path = require('path')

async function validateManifest(folderPath) {
  // Find manifest anywhere in upload folder
  const manifestPath = path.join(folderPath, 'manifest.dt.json')

  if (!await fs.pathExists(manifestPath)) {
    return { valid: false, error: 'manifest.dt.json not found' }
  }

  let manifest
  try {
    manifest = await fs.readJson(manifestPath)
  } catch (e) {
    return { valid: false, error: 'manifest.dt.json is invalid JSON' }
  }

  // Required fields
  const required = ['name', 'version', 'entry', 'author']
  for (const field of required) {
    if (!manifest[field]) {
      return { valid: false, error: `Missing required field: ${field}` }
    }
  }

  // Search for entry file anywhere in folder
  const files = await fs.readdir(folderPath)
  const entryExists = files.includes(manifest.entry)

  if (!entryExists) {
    return { 
      valid: false, 
      error: `Entry file not found: ${manifest.entry}`,
      foundFiles: files
    }
  }

  return { valid: true, manifest }
}

module.exports = { validateManifest }