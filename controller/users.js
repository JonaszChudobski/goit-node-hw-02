const passport = require("passport");
const jwt = require("jsonwebtoken");
const service = require("../service/users");
const { schemaUser } = require("../validation/validation");
const User = require("../service/schema/user");
require("dotenv").config();
const secret = process.env.SECRET;

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err) {
      res.json({
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
      res.json({
        status: "Bad request",
        code: 400,
        message: `${value.error}`,
      });
    } else {
      const user = await service.getUserByEmail({ email });
      if (user) {
        res.json({
          status: "Conflict",
          code: 409,
          message: `Email ${email} already in use`,
        });
      } else {
        const newUser = new User({ email });
        newUser.setPassword(password);
        await newUser.save();
        res.json({
          status: "Created",
          code: 201,
          data: {
            user: {
              email,
              password,
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
      res.json({
        status: "Bad request",
        code: 400,
        message: `${value.error}`,
      });
    } else {
      const user = await service.getUserByEmail({ email });
      if (!user || !user.validPassword(password)) {
        res.json({
          status: "Unauthorized",
          code: 401,
          message: "Incorrect login or password",
        });
      }
      const payload = {
        id: user.id,
      };
      const token = jwt.sign(payload, secret, { expiresIn: "1h" });
      res.json({
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
    const user = await service.getUserById({ _id });
    if (!user) {
      res.json({
        status: "Unauthorized",
        code: 401,
        message: "Unauthorized",
      });
    } else {
      await service.updateUser(_id, { token: null });
      res.json({
        status: "No content",
        code: 204,
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const current = async (req, res, next) => {
  const { _id } = req.user;
  try {
    const user = await service.getUserById({ _id });
    if (!user) {
      res.json({
        status: "Unauthorized",
        code: 401,
        message: "Unauthorized",
      });
    } else {
      res.json({
        status: "OK",
        code: 200,
        data: {
          user: {
            email: user.email,
            subscription: user.subscription,
          },
        },
      });
    }
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
