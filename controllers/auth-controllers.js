const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const { SECRET_KEY } = process.env;

const { ctrlWrapper } = require("../utils");

const { User } = require("../models/user");
const { HttpError } = require("../helpers");

const register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new HttpError(400, "Email and password are required");
  }
  const user = await User.findOne({ email });
  if (user) {
    throw new HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const result = await User.create({ ...req.body, password: hashPassword });

  res.status(201).json({
    email: result.email,
    subscription: result.subscription,
  });
};

const login = async(req, res) => {
  const {email, password} = req.body;
  const user = await User.findOne({email});
  if(!user) {
      throw HttpError(401, "Email or password invalid");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if(!passwordCompare) {
      throw HttpError(401, "Email or password invalid");
  }

  const payload = {
      id: user._id,
  }

  const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "23h"});
  await User.findByIdAndUpdate(user._id, {token});

  res.json({
      token,
  })
}

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
};
