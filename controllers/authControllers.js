import bcrypt from "bcrypt";
import HttpError from "../helpers/HttpError.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import Jimp from "jimp";
import {
  registerUserSchema,
  loginUserSchema,
  updateUserSubscriptionSchema,
} from "../schemas/usersSchema.js";
import {
  findUser,
  setToken,
  signUp,
  updateUserById,
} from "../services/authServices.js";

export const register = async (req, res, next) => {
  try {
    const { error } = registerUserSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { email } = req.body;

    const normalizedEmail = email.toLowerCase();

    const user = await findUser({ email: normalizedEmail });
    if (user) {
      throw HttpError(409, "Email in use");
    }

    const avatarURL = gravatar.url(normalizedEmail);

    const newUser = await signUp({
      ...req.body,
      email: normalizedEmail,
      avatarURL,
    });

    res.status(201).send({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { error } = loginUserSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase();

    const user = await findUser({ email: normalizedEmail });

    const isValid = await bcrypt.compare(password, user.password);

    if (!user || !isValid) {
      throw HttpError(401, "Email or password is wrong");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "23h",
    });

    await setToken(user._id, token);

    res.status(200).send({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    await setToken(_id);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const getCurrent = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;

    res.status(200).send({ email, subscription });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    if (Object.keys(req.body).length === 0) {
      throw HttpError(400, "Body must have at least one field");
    }

    const { error } = updateUserSubscriptionSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { _id } = req.user;

    const updatedUser = await updateUserById(_id, req.body);

    res.status(200).send({
      email: updatedUser.email,
      subscription: updatedUser.subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { originalname } = req.file;

    const img = await Jimp.read(req.file.path);
    await img
      .cover(
        250,
        250,
        Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE
      )
      .writeAsync(req.file.path);

    const filename = `${_id}_${originalname}`;

    await fs.rename(
      req.file.path,
      path.join(process.cwd(), "public/avatars", filename)
    );

    const avatarURL = path.join("avatars", filename);

    await updateUserById(_id, { avatarURL });

    res.status(200).send({ avatarURL });
  } catch (error) {
    next(error);
  }
};
