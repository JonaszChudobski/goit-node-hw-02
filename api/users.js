const express = require("express");
const router = express.Router();
const ctrl = require("../controller/users");

router.post("/signup", ctrl.signup);

router.post("/login", ctrl.login);

router.get("/logout", ctrl.auth, ctrl.logout);

router.get("/current", ctrl.auth, ctrl.current);

module.exports = router;
