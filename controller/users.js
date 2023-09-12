const passport = require("passport");
const jwt = require("jsonwebtoken");
const service = require("../service/users");
const { schemaUser } = require("../validation/validation");
const User = require("../service/schema/user");
require("dotenv").config();
const secret = process.env.SECRET;
const gravatar = require("gravatar");
const fs = require("fs").promises;
const jimp = require("jimp");
const sendgrid = require("@sendgrid/mail");
const uuid = require("uuid").v4();

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
    if (!value.value) {
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
        const verificationToken = uuid;
        const newUser = new User({ email, avatarURL, verificationToken });
        newUser.setPassword(password);
        await newUser.save();
        const link = `localhost:3000/api/users/verify/${verificationToken}`;
        const message = {
          to: newUser.email,
          from: process.env.SENDGRID_EMAIL,
          subject: "Email address verification",
          html: `<p>Click <a href="${link}">here</a> to verificate your email address.</p>`,
        };
        await sendgrid(message);
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
    if (!value.value) {
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
      if (!user.verify) {
        res.status(401).json({
          status: "Unauthorized",
          code: 401,
          message: "User's email not verified",
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

const avatar = async (req, res, next) => {
  const { user } = req;
  const { path: temporaryName } = req.file;
  try {
    const image = await jimp.read(temporaryName);
    image.cover(250, 250);
    const newName = user._id;
    await fs.rename(temporaryName, `public/avatars/${newName}.jpg`);
    await User.findByIdAndUpdate(user._id, {
      avatarURL: `/avatars/${newName}.jpg`,
    });
    res.status(200).json({
      message: "File uploaded successfully",
      status: 200,
      data: {
        user: {
          avatarURL: `/avatars/${newName}.jpg`,
        },
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const verification = async (req, res, next) => {
  const { verificationToken } = req.params;
  try {
    const user = service.getUserByVerificationToken(verificationToken);
    if (user) {
      await service.updateUser(user._id, {
        verificationToken: null,
        verify: true,
      });
      res.status(200).json({
        status: "OK",
        code: 200,
        message: "Verification successful",
      });
    } else {
      res.status(404).json({
        status: "Not found",
        code: 404,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const verificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const value = await schemaUser.validateAsync({
      email,
    });
    if (!value.value) {
      res.status(400).json({
        status: "Bad request",
        code: 400,
        message: `${value.error}`,
      })
    } else {
      const user = await service.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({
          status: "Not found",
          code: 404,
          message: "User not found",
        });
      }
      if (user.verify) {
        return res.status(400).json({
          status: "Bad request",
          code: 400,
          message: "Email already verified",
        });
      } else {
        const verificationToken = uuid;
        await service.updateUser(email, { verificationToken });
        const link = `localhost:3000/api/users/verify/${verificationToken}`;
        const message = {
          to: newUser.email,
          from: process.env.SENDGRID_EMAIL,
          subject: "Email address verification",
          html: `<p>Click <a href="${link}">here</a> to verificate your email address.</p>`,
        };
        await sendgrid(message);
        res.status(200).json({
          status: "OK",
          code: 200,
          message: "Verification email sent",
        });
      }
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
  avatar,
  verification,
  verificationEmail,
};
