const router   = require('express').Router()
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const passport = require('passport')
const User     = require('../models/User')
const auth     = require('../middleware/auth')

const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

// ─── Register ────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ msg: 'All fields required' })
    if (await User.findOne({ email })) return res.status(400).json({ msg: 'Email already in use' })
    const hashed = await bcrypt.hash(password, 10)
    const user   = await User.create({ name, email, password: hashed })
    const token  = makeToken(user._id)
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) { res.status(500).json({ msg: err.message }) }
})

// ─── Login ───────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !user.password) return res.status(400).json({ msg: 'Invalid credentials' })
    if (!await bcrypt.compare(password, user.password)) return res.status(400).json({ msg: 'Invalid credentials' })
    const token = makeToken(user._id)
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) { res.status(500).json({ msg: err.message }) }
})

// ─── Me (used by OAuth callback) ─────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json({ id: user._id, name: user.name, email: user.email })
  } catch (err) { res.status(500).json({ msg: err.message }) }
})

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => {
    const token = makeToken(req.user._id)
    res.redirect(`${process.env.CLIENT_URL}/oauth?token=${token}`)
  }
)

module.exports = router