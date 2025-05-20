import mongoose from "mongoose";

export const FavBookSchema = mongoose.Schema({
  isbn: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true
  }
}, {
  timestamps: true,
})

export default mongoose.model("FavBook", FavBookSchema)