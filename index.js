import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import 'dotenv/config'
import handleValidationError from "./utils/handleValidationError.js"
import checkAuth from "./utils/checkAuth.js";


import * as authValidation from "./validations/auth.js"
import * as likeBookValidation from "./validations/favBook.js"
import * as commentValidation from "./validations/comment.js"

import * as UserController from "./controllers/UserController.js"
import * as BookController from "./controllers/BookController.js"
import * as CommentController from "./controllers/CommentsController.js"

const app = express()

app.use(express.json())
app.use(cors()) 

//HTTP
app.post("/auth/register", authValidation.registerValidation, handleValidationError, UserController.register)
app.post("/auth/login", authValidation.loginValidation, handleValidationError, UserController.login)
app.get("/auth/me", checkAuth, UserController.getMe)

app.post("/find-books", BookController.findBooks)
app.post("/find-books-google", BookController.findBooksFromGoogle)
app.get("/book/all-books", checkAuth, BookController.getAllBooks)
app.post("/book-like", checkAuth, likeBookValidation.likeBookValidation, handleValidationError, BookController.likeBook)
app.get("/book-is-liked/:isbn", checkAuth, handleValidationError, BookController.getOneBook)
app.delete("/book-remove-from-fav/:id", checkAuth, BookController.removeFromFav)

app.post("/book/leave-comment", checkAuth, commentValidation.commentValidation, handleValidationError, CommentController.createComment)
app.get("/book/all-comments", CommentController.getAllComments)
app.delete("/book/remove-comment", checkAuth, handleValidationError, CommentController.removeComment)





//Start server
mongoose
.connect(process.env.MONGO_URI || process.env.LOCAL_MONGO_URI)
.then(() => console.log("DataBase Started"))
.catch((err) => console.log(err))



app.listen(process.env.PORT || process.env.LOCAL_PORT, (err) => {
  if(err) console.error(err)

  console.log('Server started');
})

