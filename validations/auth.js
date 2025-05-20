import { body } from "express-validator";

export const registerValidation = [
  body("email").isEmail(),
  body("password").isLength({ min: 5 }),
  body("login").isLength({ min: 3 })
]

export const loginValidation = [
  body("email").isEmail(),
  body("password").isLength({ min: 5 })
]