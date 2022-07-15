const { validationResult } = require("express-validator");

const { ServerError } = require("../utils/error");
const prisma = require("../utils/prisma");

exports.fetchTournaments = async (req, res, next) => {
    try {
        const tournaments = await prisma.tournament.findMany({ where: { cancelled: 0 }});
        res.status(200).json({ data: { tournaments: tournaments }});
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.fetchTournament = async (req, res, next) => {
    try {
        const tournament = await prisma.tournament.findUnique({
            where: {id: Number.parseInt(req.params.id)},
            include: {
                team: {
                    select: {
                        name: true,
                        result: true,
                        member: {
                            select: {
                                type: true,
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        mobile_number: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if(!tournament)
            return next(new ServerError('Tournament with given ID does not exist', 404, 'RESOURCE_NOT_FOUND'));

        return res.status(200).json({ data: { tournament: tournament }});
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
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
                team_size: req.body.team_size,
                event_date: req.body.event_date,
                deadline_date: req.body.deadline_date
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

    try {
        const tournament = await prisma.tournament.findUnique({ where: {id: Number.parseInt(req.params.id) }});

        if(!tournament)
            return next(new ServerError('Tournament with given ID does not exist', 404, 'RESOURCE_NOT_FOUND'));

        await prisma.tournament.update({
            where: {id: Number.parseInt(req.params.id)},
            data: {
                name: req.body.name,
                description: req.body.description,
                event_date: req.body.event_date,
                deadline_date: req.body.deadline_date
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
    try {
        const tournament = await prisma.tournament.findUnique({ where: {id: Number.parseInt(req.params.id) }});

        if(!tournament)
            return next(new ServerError('Tournament with given ID does not exist', 404, 'RESOURCE_NOT_FOUND'));

        await prisma.tournament.update({
            where: { id: Number.parseInt(req.params.id) },
            data: { cancelled: 1 }
        });

        return res.status(200).json({ data: { message: "Tournament has been cancelled successfully." }});
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.updateResult = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) 
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    try {
        const team = await prisma.team.findFirst({where: {id: req.body.team_id, tournament_id: req.body.tournament_id}});

        if(!team)
            return next(new ServerError("Team and Tournament with given ID's is invalid", 404, 'RESOURCE_NOT_FOUND'));
        
        await prisma.team.update({
            where: {id: req.body.team_id, tournament_id: req.body.tournament_id},
            data: { result: req.body.result }
        });

        return res.status(200).json({ data: { message: "Result updated successfully." }});
    }
    catch(e){
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}
