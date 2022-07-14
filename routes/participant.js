const express = require('express');
const { body } = require('express-validator');

const { fetchAvailable, fetchRegistered, fetchProfile, editProfile, applyTournament } = require("../controllers/participant");

const router = express.Router();

const editValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage("Name is required"),
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

const applyValidator = [
    body("tournament_id")
        .trim()
        .notEmpty()
        .withMessage("Tournament Id is required")
        .toInt(),
    body("team_name")
        .trim()
        .notEmpty()
        .withMessage("Team name is required"),
    body("emails")
        .notEmpty()
        .withMessage("Participant emails are required"),
];


router.get("/available", fetchAvailable);
router.get("/registered", fetchRegistered);
router.get("/profile", fetchProfile);

router.post("/profile", editValidator, editProfile);
router.post("/apply", applyValidator, applyTournament);

module.exports = router;