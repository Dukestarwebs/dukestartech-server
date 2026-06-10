const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs-extra')

router.get('/:filename', async (req, res) => {
  const filename = req.params.filename
  const filePath = path.join('./temp', filename)

  // Security check
  if (!filename.endsWith('.dta') && !filename.endsWith('.dt')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type'
    })
  }

  if (!await fs.pathExists(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    })
  }

  res.download(filePath)
})

module.exports = router