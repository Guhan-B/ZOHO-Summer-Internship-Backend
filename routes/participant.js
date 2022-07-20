const express = require('express');

const Validators = require("../utils/validators");
const Controllers = require("../controllers/participant");

const router = express.Router();

const editValidator = [
    Validators.userName,
    Validators.mobileNumber,
    Validators.bloodGroup
];

const applyValidator = [
    Validators.tournamentId,
    Validators.teamName,
    Validators.memberEmails,
];

router.get("/registered", Controllers.fetchRegistered);

router.post("/available", Controllers.fetchAvailable);
router.post("/profile", editValidator, Controllers.editProfile);
router.post("/apply", applyValidator, Controllers.applyTournament);

module.exports = router;