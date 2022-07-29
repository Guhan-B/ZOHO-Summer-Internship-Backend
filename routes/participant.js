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

const withdrawValidator =  [
    Validators.tournamentId
]

router.get("/registered", Controllers.fetchRegistered);
router.get("/available", Controllers.fetchAvailable);

router.post("/profile", editValidator, Controllers.editProfile);
router.post("/apply", applyValidator, Controllers.applyTournament);
router.post("/withdraw", withdrawValidator, Controllers.withdrawTournament);

module.exports = router;