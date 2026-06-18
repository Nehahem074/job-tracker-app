const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Job = require('./models/Job');
const User = require('./models/User');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());




// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/ai', require('./routes/ai'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('Server running')))
  .catch(err => console.error(err));


  const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});


cron.schedule('0 8 * * *', async () => {
  const today = new Date();
  const jobs = await Job.find({ followUpDate: { $lte: today } }).populate('user');
  for (const job of jobs) {
    await transporter.sendMail({
      to: job.user.email,
      subject: `Follow up on ${job.company}`,
      text: `Don't forget to follow up on your ${job.role} application at ${job.company}.`
    });
    job.followUpDate = null;
    await job.save();
  }
});