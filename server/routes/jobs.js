const router = require('express').Router()
const auth   = require('../middleware/auth')
const Job    = require('../models/Job')

// GET all jobs for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json(jobs)
  } catch (err) { res.status(500).json({ msg: err.message }) }
})

// POST create a new job
router.post('/', auth, async (req, res) => {
  try {
    const { company, role, status, jobDescription, notes, appliedDate, followUpDate } = req.body
    if (!company || !role) return res.status(400).json({ msg: 'Company and role are required' })

    const job = await Job.create({
      user: req.user.id,
      company,
      role,
      status:         status        || 'Applied',
      jobDescription: jobDescription || '',
      notes:          notes          || '',
      appliedDate:    appliedDate    || Date.now(),
      followUpDate:   followUpDate   || null,
    })
    res.status(201).json(job)
  } catch (err) { res.status(500).json({ msg: err.message }) }
})

// PUT update a job
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!job) return res.status(404).json({ msg: 'Job not found' })
    res.json(job)
  } catch (err) { res.status(500).json({ msg: err.message }) }
})

// DELETE a job
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!job) return res.status(404).json({ msg: 'Job not found' })
    res.json({ msg: 'Deleted' })
  } catch (err) { res.status(500).json({ msg: err.message }) }
})

module.exports = router