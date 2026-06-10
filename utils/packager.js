const archiver = require('archiver')
const fs = require('fs-extra')
const path = require('path')

// Build .dta (raw developer bundle)
function buildDta(folderPath, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath)
    const archive = archiver('zip', { zlib: { level: 6 } })

    output.on('close', () => resolve(outputPath))
    archive.on('error', reject)

    archive.pipe(output)
    archive.directory(folderPath, false)
    archive.finalize()
  })
}

// Build .dt (optimized user install)
function buildDt(folderPath, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => resolve(outputPath))
    archive.on('error', reject)

    archive.pipe(output)

    // Exclude dev files
    archive.glob('**/*', {
      cwd: folderPath,
      ignore: [
        '*.map',
        '*.log',
        '.git/**',
        'node_modules/**',
        'README*',
        '.env'
      ]
    })

    archive.finalize()
  })
}

module.exports = { buildDta, buildDt }