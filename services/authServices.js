import User from "../models/user.js";
import bcrypt from "bcrypt";

export async function signUp(data) {
  const { password } = data;
  const hashPassword = await bcrypt.hash(password, 10);
  return User.create({ ...data, password: hashPassword });
}

export function setToken(id, token = "") {
  return User.findByIdAndUpdate(id, { token });
}

export function findUser(email) {
  return User.findOne(email);
}

export function findUserById(id) {
  return User.findById(id);
}

export function updateUserById(id, body) {
  return User.findByIdAndUpdate(id, body, {
    new: true,
  });
}
