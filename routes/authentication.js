const express = require('express');

const Validators = require("../utils/validators");
const Controllers = require("../controllers/authentication");

const router = express.Router();

const registerValidator = [
    Validators.user_name,
    Validators.mobile_number,
    Validators.blood_group,
    Validators.email,
    Validators.password
];

const loginValidator = [
    Validators.email,
    Validators.password,
];

router.post("/register", registerValidator, Controllers.register);
router.post("/login", loginValidator, Controllers.login);

module.exports = router;