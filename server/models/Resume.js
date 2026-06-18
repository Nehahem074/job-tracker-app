const mongoose = require('mongoose');
const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileName: String,
  cloudinaryUrl: String,
  cloudinaryId: String,
}, { timestamps: true });
module.exports = mongoose.model('Resume', resumeSchema);