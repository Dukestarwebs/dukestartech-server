const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs-extra')
const { validateManifest } = require('../utils/validator')
const { buildDta, buildDt } = require('../utils/packager')

let sharedUploadPath = null

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!sharedUploadPath) {
      sharedUploadPath = path.join('./uploads', Date.now().toString())
      fs.ensureDirSync(sharedUploadPath)
    }
    cb(null, sharedUploadPath)
  },
  filename: (req, file, cb) => {
    cb(null, path.basename(file.originalname))
  }
})

const upload = multer({ storage })

router.post('/', upload.array('files'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No files uploaded'
    })
  }

  sharedUploadPath = null
  const uploadFolder = req.files[0].destination

  try {
    // Debug
    const landed = await fs.readdir(uploadFolder)
    console.log('Upload folder:', uploadFolder)
    console.log('Files found:', landed)

    const validation = await validateManifest(uploadFolder)

    if (!validation.valid) {
      await fs.remove(uploadFolder)

      return res.status(400).json({
        success: false,
        error: validation.error
      })
    }

    const { manifest } = validation

    const appName = manifest.name.replace(/\s+/g, '_')
    const version = manifest.version

    const dtaPath = path.join(
      './temp',
      `${appName}_${version}.dta`
    )

    const dtPath = path.join(
      './temp',
      `${appName}_${version}.dt`
    )

    await buildDta(uploadFolder, dtaPath)
    await buildDt(uploadFolder, dtPath)

    await fs.remove(uploadFolder)

    return res.json({
      success: true,
      message: 'App built successfully',
      app: {
        name: manifest.name,
        version: manifest.version,
        author: manifest.author
      },
      downloads: {
        dta: `/api/download/${path.basename(dtaPath)}`,
        dt: `/api/download/${path.basename(dtPath)}`
      }
    })
  } catch (err) {
    console.error(err)

    if (await fs.pathExists(uploadFolder)) {
      await fs.remove(uploadFolder)
    }

    return res.status(500).json({
      success: false,
      error: err.message
    })
  }
})

module.exports = router