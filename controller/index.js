const jwt = require("jsonwebtoken");
const service = require("../service");
const {
  schemaContact,
  schemaFavorite,
  schemaUser,
} = require("../validation/validation");
const User = require("../service/schema/user");

const get = async (req, res, next) => {
  try {
    const result = await service.listContacts();
    res.json({
      status: "Success",
      code: 200,
      data: { contacts: result },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await service.getContactById(id);
    if (!result) {
      res.json({
        status: "Error",
        code: 404,
        message: `Not found contact id: ${id}`,
        data: "Not found",
      });
    } else {
      res.json({
        status: "Success",
        code: 200,
        data: { contact: result },
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const create = async (req, res, next) => {
  const { name, email, phone } = req.body;
  try {
    const value = await schemaContact.validateAsync({ name, email, phone });
    const result = await service.addContact({
      name: value.name,
      email: value.email,
      phone: value.phone,
    });
    res.json({
      status: "Created",
      code: 201,
      data: { contact: result },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const remove = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await service.removeContact(id);
    if (result) {
      res.json({
        status: "Success",
        code: 200,
        data: { contact: result },
      });
    } else {
      res.json({
        status: "Error",
        code: 404,
        message: `Not found contact id: ${id}`,
        data: "Not found",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const update = async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  try {
    const value = await schemaContact.validateAsync({ name, email, phone });
    const result = await service.updateContact(id, {
      name: value.name,
      email: value.email,
      phone: value.phone,
    });
    if (result) {
      res.json({
        status: "Success",
        code: 200,
        data: { contact: result },
      });
    } else {
      res.json({
        status: "Error",
        code: 404,
        message: `Not found contact id: ${id}`,
        data: "Not found",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  const { id } = req.params;
  const { favorite } = req.body;
  try {
    const value = await schemaFavorite.validateAsync({ favorite });
    if (!value) {
      res.json({
        status: "Error",
        code: 400,
        message: "Missing field favorite",
      });
    } else {
      const result = await service.updateStatusContact(id, {
        favorite: value.favorite,
      });
      if (result) {
        res.json({
          status: "Success",
          code: 200,
          data: { contact: result },
        });
      } else {
        res.json({
          status: "Error",
          code: 404,
          message: `Not found contact id: ${id}`,
          data: "Not found",
        });
      }
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
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
          status: "Success",
          code: 201,
          message: "Registration successful",
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
          status: "Error",
          code: 400,
          message: "Incorrect login or password",
          data: "Bad request",
        });
      }
      const payload = {
        id: user.id,
        username: user.username,
      };
      const token = jwt.sign(payload, secret, { expiresIn: "1h" });
      res.json({
        status: "Success",
        code: 200,
        data: { token },
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = {
  get,
  getById,
  create,
  update,
  remove,
  updateStatus,
  signup,
  login,
};
