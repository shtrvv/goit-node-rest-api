import crypto from "node:crypto";
import bcrypt from "bcrypt";
import HttpError from "../helpers/HttpError.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import Jimp from "jimp";
import nodemailer from "nodemailer";
import {
  registerUserSchema,
  loginUserSchema,
  updateUserSubscriptionSchema,
  reverifyUserSchema,
} from "../schemas/usersSchema.js";
import * as authServices from "../services/authServices.js";

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

export const register = async (req, res, next) => {
  try {
    const { error } = registerUserSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { email } = req.body;

    const normalizedEmail = email.toLowerCase();

    const user = await authServices.findUser({ email: normalizedEmail });
    if (user) {
      throw HttpError(409, "Email in use");
    }

    const verificationToken = crypto.randomUUID();
    const avatarURL = gravatar.url(normalizedEmail);

    await transport.sendMail({
      to: normalizedEmail,
      from: "shatrova.liza.21@gmail.com",
      subject: "Welcome to PhoneBook",
      html: `To confirm you registration please click on the <a href="http://localhost:3000/api/users/verify/${verificationToken}">link</a>`,
      text: `To confirm you registration please open the link http://localhost:3000/api/users/verify/${verificationToken}`,
    });

    const newUser = await authServices.signUp({
      ...req.body,
      email: normalizedEmail,
      avatarURL,
      verificationToken,
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

    const user = await authServices.findUser({ email: normalizedEmail });

    const isValid = await bcrypt.compare(password, user.password);

    if (!user || !isValid) {
      throw HttpError(401, "Email or password is wrong");
    }

    if (user.verify === false) {
      throw HttpError(401, "Your account is not verified");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "23h",
    });

    await authServices.setToken(user._id, token);

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
    await authServices.setToken(_id);

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

    const updatedUser = await authServices.updateUserById(_id, req.body);

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

    await authServices.updateUserById(_id, { avatarURL });

    res.status(200).send({ avatarURL });
  } catch (error) {
    next(error);
  }
};

export const verify = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    const user = await authServices.findUser({ verificationToken });

    if (!user) {
      throw HttpError(404, "User not found");
    }

    await authServices.updateUserById(user._id, {
      verify: true,
      verificationToken: null,
    });

    res.status(200).send({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

export const reverify = async (req, res, next) => {
  try {
    if (Object.keys(req.body).length === 0) {
      throw HttpError(400, "Body must have at least one field");
    }

    const { error } = reverifyUserSchema.validate(req.body);
    if (error) {
      throw HttpError(400, "missing required field email");
    }

    const user = await authServices.findUser(req.body);

    if (!user.verify) {
      await transport.sendMail({
        to: user.email,
        from: "shatrova.liza.21@gmail.com",
        subject: "Welcome to PhoneBook",
        html: `To confirm you registration please click on the <a href="http://localhost:3000/api/users/verify/${user.verificationToken}">link</a>`,
        text: `To confirm you registration please open the link http://localhost:3000/api/users/verify/${user.verificationToken}`,
      });
    } else {
      return res
        .status(400)
        .send({ message: "Verification has already been passed" });
    }

    res.status(200).send({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};
