const express = require("express");
const router = express.Router();
const ctrl = require("../controller/users");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "tmp/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
});

router.post("/signup", ctrl.signup);

router.post("/login", ctrl.login);

router.get("/logout", ctrl.auth, ctrl.logout);

router.get("/current", ctrl.auth, ctrl.current);

router.patch("/avatars", ctrl.auth, upload.single("picture"), ctrl.avatar);

module.exports = router;
