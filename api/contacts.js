const express = require("express");
const router = express.Router();
const ctrlContacts = require("../controller/contacts");
const ctrlUsers = require("../controller/users");

router.get("/", ctrlUsers.auth, ctrlContacts.get);

router.get("/:id", ctrlUsers.auth, ctrlContacts.getById);

router.post("/", ctrlUsers.auth, ctrlContacts.create);

router.delete("/:id", ctrlUsers.auth, ctrlContacts.remove);

router.put("/:id", ctrlUsers.auth, ctrlContacts.update);

router.patch(
  "/contacts/:id/favorite",
  ctrlUsers.auth,
  ctrlContacts.updateStatus
);

module.exports = router;
