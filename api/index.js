const express = require("express");
const router = express.Router();
const ctrl = require("../controller");

router.get("/contacts", ctrl.auth, ctrl.get);

router.get("/contacts/:id", ctrl.auth, ctrl.getById);

router.post("/contacts", ctrl.auth, ctrl.create);

router.delete("/contacts/:id", ctrl.auth, ctrl.remove);

router.put("/contacts/:id", ctrl.auth, ctrl.update);

router.patch("/contacts/:id/favorite", ctrl.auth, ctrl.updateStatus);

router.post("/users/signup", ctrl.signup);

router.post("users/login", ctrl.login);

router.post("users/logout", ctrl.auth, ctrl.logout);

module.exports = router;
