const { validationResult } = require("express-validator");

const { ServerError } = require("../utils/error");
const prisma = require("../utils/prisma");

exports.fetchTournaments = async (req, res, next) => {
    try {
        const tournaments = await prisma.tournament.findMany();

        res.status(200).json({
            data: {
                tournaments: tournaments
            }
        });
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

// Find a way to get team members and their dertails in single query
exports.fetchTournament = async (req, res, next) => {
    try {
        const tournament = await prisma.tournament.findUnique({where: {id: Number.parseInt(req.params.id)}});

        if(!tournament)
            return next(new ServerError('Tournament with given ID does not exist', 404, 'RESOURCE_NOT_FOUND'));

        const teams = await prisma.team.findMany({where: {tournamentId: tournament.id}});
        
        return res.status(200).json({
            data: {
                tournament: tournament,
                teams: teams
            }
        });
    }
    catch(e) {

    }
}

exports.createTournament = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) 
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    
    try {
        const tournament = await prisma.tournament.create({
            data: {
                name: req.body.name,
                description: req.body.description,
                sport: req.body.sport,
                team_size: req.body.teamSize,
                event_date: req.body.eventDate,
                deadline_date: req.body.deadlineDate
            }
        });

        return res.status(200).json({
            data: {
                message: "Trounament has been created successfully.",
                tournament: tournament
            }
        });
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.editTournament = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) 
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));

    const tournament = await prisma.tournament.findUnique({where: {id: Number.parseInt(req.params.id)}});

    if(!tournament)
        return next(new ServerError('Tournament with given ID does not exist', 404, 'RESOURCE_NOT_FOUND'));

    try {
        await prisma.tournament.update({
            where: {id: Number.parseInt(req.params.id)},
            data: {
                name: req.body.name,
                description: req.body.description,
                sport: req.body.sport,
                team_size: req.body.teamSize,
                event_date: req.body.eventDate,
                deadline_date: req.body.deadlineDate
            }
        });
    
        return res.status(200).json({
            data: { 
                message: "Tournament details edited successfully.", 
                tournament: tournament 
            }
        });
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.cancelTournament = async (req, res, next) => {
    const tournament = await prisma.tournament.findUnique({where: {id: Number.parseInt(req.params.id)}});

    if(!tournament)
        return next(new ServerError('Tournament with given ID does not exist', 404, 'RESOURCE_NOT_FOUND'));
    
    try {
        await prisma.tournament.update({
            where: { id: Number.parseInt(req.params.id) },
            data: { cancelled: 1 }
        });

        return res.status(200).json({
            data: {
                message: "Tournament has been cancelled successfully."
            }
        });
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.updateResult = async (req, res, next) => {

}
