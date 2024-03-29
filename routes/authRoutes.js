import express from "express";
import {
  register,
  login,
  logout,
  getCurrent,
  updateSubscription,
  updateAvatar,
  verify,
  reverify,
} from "../controllers/authControllers.js";
import { auth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.post("/logout", auth, logout);

authRouter.get("/current", auth, getCurrent);

authRouter.patch("/", auth, updateSubscription);

authRouter.patch("/avatars", auth, upload.single("avatar"), updateAvatar);

authRouter.get("/verify/:verificationToken", verify);

authRouter.post("/verify", reverify);

export default authRouter;
