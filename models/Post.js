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
    enum: ["fb", "therapy", "software", "hardware", "finance", "pr", "media", "other"],
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
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
});

module.exports = mongoose.model("Post", PostSchema);
