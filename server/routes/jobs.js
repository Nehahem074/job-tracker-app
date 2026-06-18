const router = require('express').Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');

router.get('/', auth, async (req, res) => {
  const jobs = await Job.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(jobs);
});
router.post('/', auth, async (req, res) => {
  const job = await Job.create({ ...req.body, user: req.user.id });
  res.json(job);
});
router.put('/:id', auth, async (req, res) => {
  const job = await Job.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
  res.json(job);
});
router.delete('/:id', auth, async (req, res) => {
  await Job.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ msg: 'Deleted' });
});

module.exports = router;