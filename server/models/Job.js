const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  company:        { type: String, required: true, trim: true },
  role:           { type: String, required: true, trim: true },
  status: {
    type:    String,
    enum:    ['Applied', 'OA', 'Interview', 'Rejected', 'Offer'],
    default: 'Applied',
  },
  jobDescription: { type: String, default: '' },
  notes:          { type: String, default: '' },
  appliedDate:    { type: Date, default: Date.now },
  followUpDate:   { type: Date, default: null },
}, { timestamps: true })

module.exports = mongoose.model('Job', jobSchema)