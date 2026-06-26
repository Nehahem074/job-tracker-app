const express    = require('express')
const mongoose   = require('mongoose')
const cors       = require('cors')
const passport   = require('passport')
const cron       = require('node-cron')
const nodemailer = require('nodemailer')
require('dotenv').config();

console.log("CLIENT_URL =", JSON.stringify(process.env.CLIENT_URL));

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json())
app.use(passport.initialize())

// ─── Passport / Google OAuth ──────────────────────────────────────────────────
require('./config/passport')(passport)

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',   require('./routes/auth'))
app.use('/api/jobs',   require('./routes/jobs'))
app.use('/api/resume', require('./routes/resume'))
app.use('/api/ai',     require('./routes/ai'))

// ─── Cron: daily follow-up email at 8am ──────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
})

cron.schedule('0 8 * * *', async () => {
  try {
    const Job  = require('./models/Job')
    const User = require('./models/User')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const jobs = await Job.find({
      followUpDate: { $gte: today, $lt: tomorrow }
    }).populate('user')

    for (const job of jobs) {
      if (!job.user?.email) continue
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: job.user.email,
        subject: `Reminder: Follow up on ${job.company}`,
        html: `
          <p>Hi ${job.user.name},</p>
          <p>Don't forget to follow up on your <strong>${job.role}</strong> application at <strong>${job.company}</strong>.</p>
          <p>Good luck! 🍀</p>
        `
      })
    }
    console.log(`Sent ${jobs.length} follow-up reminders`)
  } catch (err) {
    console.error('Cron error:', err)
  }
})

// ─── DB + Start ───────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch(err => { console.error('DB connection failed:', err); process.exit(1) })