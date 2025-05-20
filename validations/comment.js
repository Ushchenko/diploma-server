import { body } from "express-validator";

export const commentValidation = [
  body("title", "No title").isString().notEmpty(),
  body("authors", "No authors").isArray({ min: 1 }).custom((arr) => arr.every(item => typeof item === 'string')),
  body("text", "Text should be less than 500 characters").isLength({ max:150 })
]