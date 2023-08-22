const service = require("../service");
const { schemaContact, schemaFavorite } = require("../validation/validation");

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

module.exports = {
  get,
  getById,
  create,
  update,
  remove,
  updateStatus,
};
