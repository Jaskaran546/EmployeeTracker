import Joi from "joi";

export const validation = Joi.object({
  username: Joi.string()
    .trim()
    // .pattern(new RegExp("^[a-zA-Z]{3,30}$"))
    .min(3)
    .max(30)
    .required()
    .messages({
      //   "object.regex": "Must have at least 3 characters",
    //   "string.pattern.base": "Must follow regex",
      "string.min": "Must have at least 3 characters",
      "string.max": "Must have max 30 characters",
      "string.required": "Name is required",
    }),
  phone: Joi.number().integer().min(9).max(9).required().messages({
    "number.base": "Phone Number must be a number",
    "number.max": "Phone Number must have max 9 characters",
    "number.min": "Phone Number must have min 9 character",
    "number.required": "Phone Number is required",
  }),
});

export const updateValidation = Joi.object({
  rollNo: Joi.number().integer().min(1).max(100).required().messages({
    "number.base": "Roll No must be a number",
    "number.max": "Roll No must have max 100 characters",
    "number.min": "Roll No must have min 1 character",
    "number.required": "Roll No is required",
  }),
});
