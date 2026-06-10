const express = require('express')
const fs = require('fs-extra')
const path = require('path')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// Ensure folders exist
fs.ensureDirSync('./uploads')
fs.ensureDirSync('./temp')

// Routes
app.use('/api/build', require('./routes/build'))
app.use('/api/download', require('./routes/download'))

app.get('/', (req, res) => {
  res.json({
    message: 'DukestarTech Build Server',
    version: '1.0.0',
    status: 'running'
  })
})

app.listen(PORT, () => {
  console.log(`DukestarTech server running on port ${PORT}`)
})