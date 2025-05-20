import { body } from "express-validator";

export const likeBookValidation = [
  body("isbn", "Wrong ISBN").isLength({ min: 13, max: 13 }).isNumeric()
]