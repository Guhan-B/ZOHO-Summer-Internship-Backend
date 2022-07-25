const { validationResult } = require("express-validator");

const { ServerError } = require("../utils/error");
const prisma = require("../utils/prisma");

exports.fetchTournaments = async (req, res, next) => {
    try {
        const tournaments = await prisma.tournament.findMany();
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
                        id: true,
                        name: true,
                        result: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                                mobile_number: true,
                            }
                        }
                    }
                }
            }
        });

        if(!tournament)
            return next(new ServerError('Tournament does not exist', 404, 'RESOURCE_NOT_FOUND'));

        return res.status(200).json({ data: { tournament: tournament }});
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.createTournament = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        const error = {
            name: false, 
            description: false,
            sport: false,
            teamSize: false,
            eventDate: false,
            deadlineDate: false
        };

        err.array().forEach(e => error[e.param] = true);

        return next(new ServerError('One or more inputs in invalid', 422, 'VALIDATION_FAILED', error));
    }
    
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
                message: "Trounament has been created successfully",
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

    if (!err.isEmpty()) {
        const error = {
            name: false, 
            description: false,
            sport: false,
            teamSize: false,
            eventDate: false,
            deadlineDate: false
        };

        err.array().forEach(e => error[e.param] = true);

        return next(new ServerError('One or more inputs in invalid', 422, 'VALIDATION_FAILED', error));
    }

    try {
        const tournament = await prisma.tournament.findUnique({ where: {id: Number.parseInt(req.params.id) }});

        if(!tournament)
            return next(new ServerError('Tournament does not exist', 404, 'RESOURCE_NOT_FOUND'));

        await prisma.tournament.update({
            where: {id: Number.parseInt(req.params.id)},
            data: {
                name: req.body.name,
                description: req.body.description,
                event_date: req.body.eventDate,
                deadline_date: req.body.deadlineDate
            }
        });
    
        return res.status(200).json({
            data: { 
                message: "Tournament details edited successfully", 
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
            return next(new ServerError('Tournament does not exist', 404, 'RESOURCE_NOT_FOUND'));

        await prisma.tournament.update({
            where: { id: Number.parseInt(req.params.id) },
            data: { cancelled: 1 }
        });

        await prisma.team.updateMany({
            where: {
                tournament_id: Number.parseInt(req.params.id)
            },
            data: {
                result: 5
            }
        })

        return res.status(200).json({ data: { message: "Tournament has been cancelled successfully" }});
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

// For Reference
// RESULTS = [
//     { label: "PENDING", value: 0, class: styles.pending },
//     { label: "NOT PARTICIPATED", value: 1, class: styles.not_participated  },
//     { label: "DISQUALIFIED", value: 2, class: styles.disqualified  },
//     { label: "LOST", value: 3, class: styles.lost },
//     { label: "WINNER", value: 4, class: styles.winner },
// ];

exports.updateResult = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) 
        return next(new ServerError('One or more inputs in invalid', 422, 'VALIDATION_FAILED', err.array()));
        
    try {
        const team = await prisma.team.findFirst({where: {id: req.body.teamId, tournament_id: req.body.tournamentId}});

        if(!team)
            return next(new ServerError("The team is not registered for the given tournament", 404, 'RESOURCE_NOT_FOUND'));

        console.log(req.body.result);

        if(req.body.result == 4) {
            const winner = await prisma.team.findFirst({
                where: {tournament_id: req.body.tournamentId, result: 4}
            });

            if(winner)
                return next(new ServerError('Already assigned a winner for this tournament', 422, 'VALIDATION_FAILED'));
        }
        
        await prisma.team.update({
            where: {id: req.body.teamId },
            data: { result: req.body.result }
        });

        return res.status(200).json({ data: { message: "Result updated successfully" }});
    }
    catch(e){
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}
