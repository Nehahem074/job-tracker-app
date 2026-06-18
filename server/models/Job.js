const mongoose = require('mongoose');
const jobSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  company: String,
  role: String,
  status: { type: String, enum: ['Applied','OA','Interview','Rejected','Offer'], default: 'Applied' },
  jobDescription: String,
  appliedDate: { type: Date, default: Date.now },
  notes: String,
  followUpDate: Date,
}, { timestamps: true });
module.exports = mongoose.model('Job', jobSchema);