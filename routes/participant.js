const express = require('express');

const Validators = require("../utils/validators");
const Controllers = require("../controllers/participant");

const router = express.Router();

const editValidator = [
    Validators.user_name,
    Validators.mobile_number,
    Validators.blood_group
];

const applyValidator = [
    Validators.tournament_id,
    Validators.team_name,
    Validators.member_emails,
];


router.get("/available", Controllers.fetchAvailable);
router.get("/registered", Controllers.fetchRegistered);
router.get("/profile", Controllers.fetchProfile);

router.post("/profile", editValidator, Controllers.editProfile);
router.post("/apply", applyValidator, Controllers.applyTournament);

module.exports = router;