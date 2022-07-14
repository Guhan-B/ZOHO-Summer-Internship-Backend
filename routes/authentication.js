const express = require('express');
const { body } = require('express-validator');

const { register, login } = require("../controllers/authentication");

const router = express.Router();

const registerValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage("Name is required"),
    body('email')
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email badly formated"),
    body('password')
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Passowrd should be minimum 8 characters long"),
    body('mobile_number')
        .trim()
        .notEmpty()
        .withMessage("Mobile Number is required")
        .isLength({ min: 10, max: 10 })
        .withMessage("Mobile Number badly formated"),
    body('blood_group')
        .trim()
        .notEmpty()
        .withMessage("Blood Group is required")
        .custom(value => {
            const valid = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

            if (!valid.includes(value)) {
                throw new Error("Blood Group is invalid");
            }

            return true;
        })
];

const loginValidator = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email badly formated"),
    body('password')
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Passowrd should be minimum 8 characters long"),
];

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);

module.exports = router;