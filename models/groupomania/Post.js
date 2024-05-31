const mongoose = require("mongoose");

const postSchema = mongoose.Schema ({
  userId: { type: String, required: true },
  postMessage: { type: String, required: true },
  imageUrl: { type: String, required: true },
  likes: { type: Number, required: true, default: 0 },
  dislikes: { type: Number, required: true, default: 0 },
  usersLiked: { type: Array, required: true },
  usersDisliked: { type: Array, required: true },
});

module.exports = mongoose.model("Post", postSchema);