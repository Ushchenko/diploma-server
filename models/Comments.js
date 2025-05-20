import mongoose from "mongoose";

export const CommentsSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true,
  },
  authors: {
    type: [String],
    required: true,
  },
  text: {
    type: String,
    required: true,
  }
})

export default mongoose.model("Comment", CommentsSchema);