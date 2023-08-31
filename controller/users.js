const passport = require("passport");
const jwt = require("jsonwebtoken");
const service = require("../service/users");
const { schemaUser } = require("../validation/validation");
const User = require("../service/schema/user");
require("dotenv").config();
const secret = process.env.SECRET;
const gravatar = require("gravatar");

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (
      !user ||
      err ||
      req.headers.authorization.split(" ")[1] !== user.token
    ) {
      res.status(401).json({
        status: "Error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

const signup = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const value = await schemaUser.validateAsync({
      email,
      password,
    });
    if (value.value === {}) {
      res.status(400).json({
        status: "Bad request",
        code: 400,
        message: `${value.error}`,
      });
    } else {
      const user = await service.getUserByEmail({ email });
      if (user) {
        res.status(409).json({
          status: "Conflict",
          code: 409,
          message: `Email ${email} already in use`,
        });
      } else {
        const avatarURL = gravatar.url(email, { d: "retro" }, true);
        const newUser = new User({ email, avatarURL });
        newUser.setPassword(password);
        await newUser.save();
        res.status(201).json({
          status: "Created",
          code: 201,
          data: {
            user: {
              email,
              password,
              avatarURL,
            },
          },
        });
      }
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const value = await schemaUser.validateAsync({
      email,
      password,
    });
    if (value.value === {}) {
      res.status(400).json({
        status: "Bad request",
        code: 400,
        message: `${value.error}`,
      });
    } else {
      const user = await service.getUserByEmail({ email });
      if (!user || !user.validPassword(password)) {
        res.status(401).json({
          status: "Unauthorized",
          code: 401,
          message: "Incorrect login or password",
        });
      }
      const payload = {
        id: user.id,
      };
      const token = jwt.sign(payload, secret, { expiresIn: "1h" });
      await service.updateUser(user._id, { token });
      res.status(200).json({
        status: "Success",
        code: 200,
        data: {
          token,
          user: {
            email: user.email,
            password: user.password,
          },
        },
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const logout = async (req, res, next) => {
  const { _id } = req.user;
  try {
    await service.updateUser(_id, { token: null });
    res.status(204).json({
      status: "No content",
      code: 204,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const current = async (req, res, next) => {
  try {
    res.status(200).json({
      status: "OK",
      code: 200,
      data: {
        user: {
          email: req.user.email,
          subscription: req.user.subscription,
          token: req.user.token,
        },
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  auth,
  current,
};
