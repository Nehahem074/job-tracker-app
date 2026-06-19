const router      = require('express').Router()
const auth        = require('../middleware/auth')
const cloudinary  = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer      = require('multer')
const Resume      = require('../models/Resume')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'job-tracker-resumes',
    resource_type:  'raw',
    allowed_formats: ['pdf'],
    use_filename:   true,
    unique_filename: true,
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    file.mimetype === 'application/pdf' ? cb(null, true) : cb(new Error('Only PDF allowed'))
  },
})

router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    const resume = await Resume.create({
      user:          req.user.id,
      fileName:      req.file.originalname,
      cloudinaryUrl: req.file.path,
      cloudinaryId:  req.file.filename,
    })
    res.status(201).json(resume)
  } catch (err) { res.status(500).json({ msg: err.message }) }
})

router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json(resumes)
  } catch (err) { res.status(500).json({ msg: err.message }) }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id })
    if (!resume) return res.status(404).json({ msg: 'Not found' })
    await cloudinary.uploader.destroy(resume.cloudinaryId, { resource_type: 'raw' })
    await resume.deleteOne()
    res.json({ msg: 'Deleted' })
  } catch (err) { res.status(500).json({ msg: err.message }) }
})

module.exports = router