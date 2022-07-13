const express = require('express');
const { body } = require('express-validator');

const { fetchTournaments, fetchTournament, createTournament, editTournament, cancelTournament } = require("../controllers/administrator");

const router = express.Router();

const tournamentValidator = [
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

router.get("/tournaments", fetchTournaments);
router.get("/tournaments/:id", fetchTournament);

router.post("/tournaments/create", tournamentValidator, createTournament);
router.post("/tournaments/edit/:id", tournamentValidator, editTournament);
router.post("/tournaments/cancel/:id", cancelTournament);

module.exports = router;