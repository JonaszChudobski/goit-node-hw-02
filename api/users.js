const express = require("express");
const router = express.Router();
const ctrl = require("../controller/users");
const multer = require("multer");

const upload = multer({
  dest: "tmp/",
});

router.post("/signup", ctrl.signup);

router.post("/login", ctrl.login);

router.get("/logout", ctrl.auth, ctrl.logout);

router.get("/current", ctrl.auth, ctrl.current);

router.patch("/avatars", ctrl.auth, upload.single("avatar"), ctrl.avatar);

router.get("/verify/:verificationToken", ctrl.auth, ctrl.verification);

router.post("/verify", ctrl.auth, ctrl.verificationEmail);

module.exports = router;
