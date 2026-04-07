const mongoose = require('mongoose');

const roleModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  story: { type: String, required: true },
  achievements: [{ type: String }],
  imageUrl: { type: String },
  quoteText: { type: String },
  quoteAttr: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RoleModel', roleModelSchema);
