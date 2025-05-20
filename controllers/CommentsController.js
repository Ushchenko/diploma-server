import CommentModel from "../models/Comments.js";


export const createComment = async (req, res) => {
  try {
    const doc = new CommentModel({
      user: req.userId,
      title: req.body.title,
      authors: req.body.authors,
      text: req.body.text,
    })

    const comment = await doc.save()
    res.json(comment)
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.response
        ? err.response.data
        : "Failed to leave comment"
    })
  }
}

export const getAllComments = async (req, res) => {
  try {
    const { title, author } = req.query

    let query = {}

    if (title) {
      query.title = { $regex: new RegExp(title, "i") }
    }

    if (author) {
      query.authors = { $elemMatch: { $regex: new RegExp(author, "i") } }
    }

    const comments = await CommentModel.find(query)
      .populate("user", "login email")
      .exec()

    return res.status(200).json(comments)
  } catch (err) {
    console.error("Error:", err)
    return res.status(500).json({
      success: false,
      error: err.response ? err.response.data : "Failed to get comments"
    })
  }
}

export const removeComment = async (req, res) => {
  try {
    const commentId = req.body.commentId;

    const comment = await CommentModel.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "You can delete only your own comments" });
    }

    await CommentModel.findByIdAndDelete(commentId);

    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to delete comment"
    });
  }
};
