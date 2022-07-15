const { PrismaClientKnownRequestError } = require("@prisma/client/runtime");
const { validationResult } = require("express-validator");

const { ServerError } = require("../utils/error");
const prisma = require("../utils/prisma");

exports.fetchAvailable = async (req, res, next) => {
    try {
        const registeredTournaments = await prisma.member.findMany({
            where: {
                user_id: req.user.id
            },
            select: {
                tournament_id: true
            }
        });

        const registeredTournamentsIDs = registeredTournaments.map(item => item.tournament_id);

        const availableTournaments = await prisma.tournament.findMany({
            where: {
                id: {
                    notIn: registeredTournamentsIDs
                },
                cancelled: 0,
                deadline_date: {
                    gte: req.body.today
                }
            }
        });

        return res.status(200).json({
            data: {
                tournaments: availableTournaments
            }
        });
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.fetchRegistered = async (req, res, next) => {
    try {
        const result = await prisma.member.findMany({
            where: { user_id: req.user.id },
            select: {
                tournament: true,
                team: {
                    select: {
                        id: true,
                        name: true,
                        result: true,
                        member: {
                            select: {
                                type: true,
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const tournaments = result.map(item => {
            item.tournament.team = item.team;
            return item.tournament;
        });

        return res.status(200).json({ data: { tournaments: tournaments }});
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.fetchProfile = async (req, res, next) => {
    return res.status(200).json({data: { user: [req.user].map(({ password, role, ...rest }) => rest)[0] }});
}

exports.editProfile = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) 
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));

    try {
        await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                name: req.body.name,
                mobile_number: req.body.mobile_number,
                blood_group: req.body.blood_group,
            }
        });

        return res.status(200).json({data: { message: "Profile updated successfully." }});
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.applyTournament = async (req, res, next) => {
    const err = validationResult(req);
    let team_id;

    if (!err.isEmpty()) 
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));

    try {
        const tournament = await prisma.tournament.findUnique({where: { id: req.body.tournament_id }});

        if(!tournament)
            return next(new ServerError('Tournament with given ID does not exist', 422, 'VALIDATION_FAILED'));
        
        if(req.body.today > tournament.deadline_date) 
            return next(new ServerError('Registeration Deadline is reached', 422, 'VALIDATION_FAILED'));

        if(req.body.emails.length !== tournament.team_size)
            return next(
                new ServerError(`Team size is invalid. Required size is ${tournament.team_size}`, 422, 'VALIDATION_FAILED')
            );
        
        const result = await prisma.user.findMany({
            where: {
                email: {
                    in: req.body.emails
                }
            },
            select: {
                id: true,
                email: true
            }
        });

        const registeredEmails = result.map(item => item.email);
        const errors = Array.apply(null, Array(tournament.team_size)).map(() => false)

        for(let i = 0 ; i < req.body.emails.length; i++) {
            if(!registeredEmails.includes(req.body.emails[i]))
                errors[i] = true;
        }

        if(errors.reduce((previous, current) => previous || current))
            return next(new ServerError('One or more provided emails not registered', 404, 'EMAILS_NOT_REGISTERED', errors));
        
        const team = await prisma.team.create({
            data: {
                name: req.body.team_name,
                size: tournament.team_size,
                tournament_id: tournament.id
            }
        });

        team_id = team.id;

        const members = result.map(item => {
            return {
                user_id: item.id,
                team_id: team.id,
                tournament_id: tournament.id,
                type: 0
            };
        });

        members[0].type = 1;

        await prisma.member.createMany({ data: members });

        return res.status(200).json({data: { message: "Applied for tournament successfully." }});
    }
    catch(e) {
        if(e instanceof PrismaClientKnownRequestError && e.meta.target === "uc_member") {
            await prisma.team.delete({where: {id: team_id}});
            return next(new ServerError('One or more members already registered', 401, 'VALIDATION_FAILED'));
        }
        
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}