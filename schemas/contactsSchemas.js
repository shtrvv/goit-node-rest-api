import Joi from "joi";

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3),
  email: Joi.string(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
});

export const updateStatusSchema = Joi.object({
  favorite: Joi.boolean().required(),
});
