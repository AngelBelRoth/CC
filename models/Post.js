const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  image: {
    type: String,
    require: true,
  },
  cloudinaryId: {
    type: String,
    require: true,
  },
  company: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  businessType: {
    type: String,
    enum: ["software", "hardware", "finance", "pr", "media", "other"],
    required: true,
  },
  ps: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  looking: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", PostSchema);
