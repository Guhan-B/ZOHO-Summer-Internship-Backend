const express = require('express');
const { body } = require('express-validator');

const { fetchTournaments, fetchTournament, createTournament, editTournament, cancelTournament, updateResult } = require("../controllers/administrator");

const router = express.Router();

const createTournamentValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage("Tournament name is required"),
    body('description')
        .trim()
        .notEmpty()
        .withMessage("Tournament description is required"),
    body('sport')
        .trim()
        .notEmpty()
        .withMessage("Sport name is required"),
    body('teamSize')
        .trim()
        .notEmpty()
        .withMessage("Team size is required")
        .isInt({ min: 1 })
        .withMessage("Team size cannot be less that 1")
        .toInt(),
    body("eventDate")
        .trim()
        .notEmpty()
        .withMessage("Event date is required"),
    body("eventDate")
        .trim()
        .notEmpty()
        .withMessage("Deadline date is required")
];

const editTournamentValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage("Tournament name is required"),
    body('description')
        .trim()
        .notEmpty()
        .withMessage("Tournament description is required"),
    body("eventDate")
        .trim()
        .notEmpty()
        .withMessage("Event date is required"),
    body("eventDate")
        .trim()
        .notEmpty()
        .withMessage("Deadline date is required")
];

const resultValidator = [
    body("teamId")
        .trim()
        .notEmpty()
        .withMessage("Team ID is required")
        .toInt(),
    body("tournamentId")
        .trim()
        .notEmpty()
        .withMessage("Torunament ID is required")
        .toInt(),
    body("result")
        .trim()
        .notEmpty()
        .withMessage("Result is required")
        .isInt({ min: 1, max: 4 })
        .withMessage("Result invalid")
        .toInt(),
]

router.get("/tournaments", fetchTournaments);
router.get("/tournaments/:id", fetchTournament);

router.post("/tournaments/create", createTournamentValidator, createTournament);
router.post("/tournaments/edit/:id", editTournamentValidator, editTournament);
router.post("/tournaments/cancel/:id", cancelTournament);

router.post("/team/result", resultValidator, updateResult)

module.exports = router;