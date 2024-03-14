import Joi from "joi";

export const registerUserSchema = Joi.object({
  name: Joi.string(),
  password: Joi.string().min(6).required(),
  email: Joi.string().required(),
  subscription: Joi.string(),
});

export const loginUserSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().required(),
});

export const updateUserSubscriptionSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

export const reverifyUserSchema = Joi.object({
  email: Joi.string().required(),
});
