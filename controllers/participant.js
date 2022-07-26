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
    console.log(req.user);
    try {
        const result = await prisma.member.findMany({
            where: { email: req.user.email },
            select: {
                tournament: true,
                team: {
                    include: {
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
        });

        const tournaments = result.map(item_1 => {
            item_1.team.member = item_1.team.member.map(item_2 => item_2.user);
            return {...item_1.tournament, team: item_1.team};
        })

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
            name: { value: false, message: "" },
            bloodGroup: { value: false, message: "" },
            mobileNumber: { value: false, message: "" },
        };

        err.array().forEach(e => error[e.param] = { value: true, message: e.msg });

        return next(new ServerError('One or more inputs in invalid', 422, 'VALIDATION_FAILED', error));
    }
    try {
        console.log(req.body);

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

        return res.status(200).json({data: { message: "Profile updated successfully" }});
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.applyTournament = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Inputs cannot be empty', 422, 'VALIDATION_FAILED'));
    }

    try {
        const tournament = await prisma.tournament.findUnique({ where: { id: req.body.tournamentId }});

        if(!tournament)
            return next(new ServerError('Tournament does not exist', 422, 'VALIDATION_FAILED'));

        if(tournament.cancelled === 1)
            return next(new ServerError('Tournament has been cancelled', 422, 'VALIDATION_FAILED'));

        if(new Date() > new Date(tournament.deadline_date))
            return next(new ServerError("Cannot apply to tournament. Deadline reached", 422, "VALIDATION_FAILED"));
        
        if(req.body.emails.length !== tournament.team_size)
            return next(new ServerError(`Team size is invalid. Required size is ${tournament.team_size}`, 422, 'VALIDATION_FAILED'));

        if(req.body.names.length !== tournament.team_size)
            return next(new ServerError(`Team size is invalid. Required size is ${tournament.team_size}`, 422, 'VALIDATION_FAILED'));
        
        let result = await prisma.member.findMany({
            select: {
                email: true
            },
            where: {
                tournament_id: tournament.id,
                email: {
                    in: req.body.emails
                }
            }
        });

        if(result.length !== 0) {
            result = result.map(item => item.email);

            const emails = Array.apply(null, Array(req.body.emails.length)).map(() => {return { value: false, message: "" }});
            const names = Array.apply(null, Array(req.body.emails.length)).map(() => {return { value: false, message: "" }});
            
            for(let i = 0; i < tournament.team_size; i++) {
                if(result.includes(req.body.emails[i])) {
                    emails[i] = { value: true, message: "Member is already registered for this tournament" };
                    names[i] = { value: true, message: "Member is already registered for this tournament" };
                } 
            }

            const error = {
                teamName: false, 
                emails: emails, 
                names: names
            };
            
            return next(new ServerError('One or more members already registered', 422, 'VALIDATION_FAILED', error));
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

exports.withdraw = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) 
        return next(new ServerError('One or more inputs in invalid', 422, 'VALIDATION_FAILED', err.array()));

    try {
        const result = await prisma.member.findUnique({
            where: {
                tournament_id_email: {
                    email: req.user.email,
                    tournament_id: req.body.tournamentId
                }
            },
            select: {
                team : {
                    select: {
                        id: true,
                        leader_id: true
                    }
                },
                tournament: {
                    select: {
                        deadline_date: true
                    }
                }
            }
        });

        if(!result)
            return next(new ServerError('Your are not registered to this tournament', 422, 'VALIDATION_FAILED')); 

        if(req.user.id !== result.team.leader_id)
            return next(new ServerError('Your are not leader of this team', 422, 'VALIDATION_FAILED')); 
        
        if(new Date() > new Date(result.tournament.deadline_date))
            return next(new ServerError('Cannot withdraw deadline is reached', 422, 'VALIDATION_FAILED')); 

        await prisma.member.deleteMany({
            where: {
                team_id: result.team.id
            },
        });

        await prisma.team.delete({
            where: {
                id: result.team.id
            }
        });

        return res.status(200).json({ data: { message: "Withdrawed from tournament successfully" } });
    }
    catch(e) {
        console.log(e);    
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}