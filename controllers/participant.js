const { PrismaClientKnownRequestError } = require("@prisma/client/runtime");
const { validationResult } = require("express-validator");

const { ServerError } = require("../utils/error");
const prisma = require("../utils/prisma");

exports.fetchAvailable = async (req, res, next) => {
    try {
        const registeredTournaments = await prisma.member.findMany({
            where: {
                email: req.user.email
            },
            select: {
                tournament_id: true
            }
        });

        const registeredTournamentsIDs = registeredTournaments.map(item => item.tournament_id);

        let availableTournaments = await prisma.tournament.findMany({
            where: {
                id: {
                    notIn: registeredTournamentsIDs
                },
                cancelled: 0,
            }
        });

        const today = new Date();

        availableTournaments = availableTournaments.filter(item => new Date(item.deadline_date) >= today);

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
            where: { email: req.user.email },
            select: {
                tournament: {
                    select : {
                        id: true,
                        name: true,
                        sport: true,
                        description: true,
                        event_date: true,
                        deadline_date: true,
                        cancelled: true,
                        team: {
                            select: {
                                id: true,
                                name: true,
                                result: true,
                                leader_id: true,
                                member: {
                                    select: {
                                        user: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        console.log(result);

        const tournaments = result.map(item_1 => {
            item_1.tournament.team[0].member = item_1.tournament.team[0].member.map(item_2 => {
                return {...item_2.user};
            })
            item_1.tournament.team = item_1.tournament.team[0];
            return item_1.tournament;
        });

        return res.status(200).json({ data: { tournaments }});
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.editProfile = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        const error = {
            name: false, 
            mobileNumber: false, 
            bloodGroup: false, 
            email: false, 
        };

        err.array().forEach(e => error[e.param] = true);

        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', error));
    }

    try {
        await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                name: req.body.name,
                mobile_number: req.body.mobileNumber,
                blood_group: req.body.bloodGroup,
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

    if (!err.isEmpty()) {
        const error = {
            tournamentId: false, 
            teamName: false, 
            emails: false, 
        };

        err.array().forEach(e => error[e.param] = true);

        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', error));
    }

    try {
        const tournament = await prisma.tournament.findUnique({ where: { id: req.body.tournamentId }});

        if(!tournament)
            return next(new ServerError('Tournament with given ID does not exist', 422, 'VALIDATION_FAILED'));
        
        if(req.body.emails.length !== tournament.team_size)
            return next(new ServerError(`Team size is invalid. Required size is ${tournament.team_size}`, 422, 'VALIDATION_FAILED'));
        
        let result = await prisma.member.findMany({
            select: {
                email: true
            },
            where: {
                tournament_id: tournament.id,
                email: {
                    in: req.body.email
                }
            }
        });

        if(result.length !== 0) {
            result = result.map(item => item.email);
            const emails = Array.apply(null, Array(req.body.emails.length)).map(() => false);
            for(let i = 0; i < emails.length; i++) {
                if(result.includes(req.body.emails[i])) 
                    emails[i] = true;
            }
            const error = {
                tournamentId: false, 
                teamName: false, 
                emails: emails, 
            };
            return next(new ServerError('One or more members already registered', 401, 'EMAILS_ALREADY_REGISTERED', error));
        }
        
        const leaderUser= await prisma.user.findUnique({ where:{ email: req.body.emails[0] }});

        result = await prisma.user.findMany({
            where: { email:{ in: req.body.emails }, role: 0 },
            select: { email: true }
        });

        const registeredEmails = result.map(item => item.email);
        const passiveUserData = [];

        for(let i = 0 ; i < tournament.team_size; i++) {
            if(registeredEmails.includes(req.body.emails[i]) === false) {
                passiveUserData.push({ name: req.body.names[i], email: req.body.emails[i], active: 0, role: 0 });
            }
        }
        if(passiveUserData.length > 0)
            await prisma.user.createMany({ data: passiveUserData });
        
        const team = await prisma.team.create({
            data: {
                name: req.body.teamName,
                size: tournament.team_size,
                tournament_id: tournament.id,
                leader_id: leaderUser.id
            }
        });

        const memberData = req.body.emails.map(email => {
            return {
                email: email,
                team_id: team.id,
                tournament_id: tournament.id,
            };
        });

        await prisma.member.createMany({ data: memberData });

        return res.status(200).json({data: { message: "Applied for tournament successfully" }});
    }
    catch(e) {
        console.log(e);    
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}