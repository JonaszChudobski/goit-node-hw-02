const express = require("express");
const router = express.Router();
const ctrl = require("../controller");

router.get("/contacts", ctrl.get);

router.get("/contacts/:id", ctrl.getById);

router.post("/contacts", ctrl.create);

router.delete("/contacts/:id", ctrl.remove);

router.put("/contacts/:id", ctrl.update);

router.patch("/contacts/:id/favorite", ctrl.updateStatus);

router.post("/users/signup", ctrl.signup);

router.post("users/login", ctrl.login);

module.exports = router;
