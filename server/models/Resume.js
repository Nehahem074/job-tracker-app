const mongoose = require('mongoose')

const resumeSchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  fileName:      { type: String, required: true },
  cloudinaryUrl: { type: String, required: true },
  cloudinaryId:  { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.model('Resume', resumeSchema)