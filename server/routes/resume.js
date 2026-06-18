const router = require('express').Router();
const auth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const Resume = require('../models/Resume');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'resumes', resource_type: 'raw', allowed_formats: ['pdf'] },
});
const upload = multer({ storage });

router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  const resume = await Resume.create({
    user: req.user.id,
    fileName: req.file.originalname,
    cloudinaryUrl: req.file.path,
    cloudinaryId: req.file.filename,
  });
  res.json(resume);
});

router.get('/', auth, async (req, res) => {
  const resumes = await Resume.find({ user: req.user.id });
  res.json(resumes);
});

module.exports = router;