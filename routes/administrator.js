const express = require('express');

const Validators = require("../utils/validators");
const Controllers = require("../controllers/administrator");

const router = express.Router();

const createTournamentValidator = [
    Validators.tournament_name,
    Validators.description,
    Validators.sport,
    Validators.team_size,
    Validators.event_date,
    Validators.deadline_date
];

const editTournamentValidator = [
    Validators.tournament_name,
    Validators.description,
    Validators.event_date,
    Validators.deadline_date
];

const resultValidator = [
    Validators.team_id,
    Validators.tournament_id,
    Validators.result
]

router.get("/tournaments", Controllers.fetchTournaments);
router.get("/tournaments/:id", Controllers.fetchTournament);

router.post("/tournaments/create", createTournamentValidator, Controllers.createTournament);
router.post("/tournaments/edit/:id", editTournamentValidator, Controllers.editTournament);
router.post("/tournaments/cancel/:id", Controllers.cancelTournament);

router.post("/team/result", resultValidator, Controllers.updateResult)

module.exports = router;