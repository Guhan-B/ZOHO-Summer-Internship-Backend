const express = require('express');

const Validators = require("../utils/validators");
const Controllers = require("../controllers/administrator");

const router = express.Router();

const createTournamentValidator = [
    Validators.tournamentName,
    Validators.description,
    Validators.sport,
    Validators.teamSize,
    Validators.eventDate,
    Validators.deadlineDate
];

const editTournamentValidator = [
    Validators.tournamentName,
    Validators.description,
    Validators.eventDate,
    Validators.deadlineDate
];

const resultValidator = [
    Validators.teamId,
    Validators.tournamentId,
]

const addValidator = [
    Validators.memberEmails,
]

router.get("/tournaments", Controllers.fetchTournaments);
router.get("/tournaments/:id", Controllers.fetchTournament);

router.post("/tournaments/create", createTournamentValidator, Controllers.createTournament);
router.post("/tournaments/edit/:id", editTournamentValidator, Controllers.editTournament);
router.post("/tournaments/cancel/:id", Controllers.cancelTournament);
router.post("/team/result", resultValidator, Controllers.updateResult);
router.post("/add", addValidator, Controllers.addAdministrators);

module.exports = router;