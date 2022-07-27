const express = require('express');

const Validators = require("../utils/validators");
const Controllers = require("../controllers/authentication");
const accessHandler = require("../middlewares/authentication");

const router = express.Router();

const registerValidator = [
    Validators.userName,
    Validators.mobileNumber,
    Validators.bloodGroup,
    Validators.email,
    Validators.password
];

const loginValidator = [
    Validators.email,
    Validators.password,
];

const resetValidator = [
    Validators.password,
];

router.post("/register", registerValidator, Controllers.register);
router.post("/login", loginValidator, Controllers.login);
router.post("/reset-password", accessHandler([0, 1]), resetValidator, Controllers.resetPassword);
router.post("/logout", accessHandler([0, 1]), Controllers.logout);

router.get("/user", accessHandler([0, 1]), Controllers.user);

module.exports = router;