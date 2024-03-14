import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import { findUserById } from "../services/authServices.js";

export const auth = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return next(HttpError(401));
  }

  const [bearer, token] = authorizationHeader.split(" ");
  if (bearer !== "Bearer") {
    return next(HttpError(401));
  }

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(id);

    if (!user || !user.token || user.token !== token || !user.verify) {
      return next(HttpError(401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(HttpError(401));
  }
};
