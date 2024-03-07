import express from "express";
import {
  register,
  login,
  logout,
  getCurrent,
  updateSubscription,
} from "../controllers/authControllers.js";
import { auth } from "../middleware/auth.js";

const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.post("/logout", auth, logout);

authRouter.get("/current", auth, getCurrent);

authRouter.patch("/", auth, updateSubscription);

export default authRouter;
