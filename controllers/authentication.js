const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const { ServerError } = require("../utils/error");
const prisma = require("../utils/prisma");

exports.login = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const user = await prisma.user.findUnique({where: {email: req.body.email}});

        if(!user)
            return next(new ServerError('Email does not exist', 401, 'AUTHENTICATION_FAILED'));
        
        const isPasswordSame = await bcrypt.compare(req.body.password, user.password);

        if (!isPasswordSame) 
            return next(new ServerError('Password does not match', 401, 'AUTHENTICATION_FAILED'));
        
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                mobileNumber: user.mobile_number,
                bloodGroup: user.blood_group,
                role: user.role
            },
            process.env.ACCESS_TOKEN_KEY + user.password,
            {
                expiresIn: '24h'
            }
        );

        return res.status(200).json({
            data: {
                token: token
            }
        });
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.register = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) 
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));

    try {
        const user = await prisma.user.findUnique({ where: {email: req.body.email}});
        
        if(user)
            return next(new ServerError('Email already exist', 422, 'VALIDATION_FAILED'));
        
        const hash = await bcrypt.hash(req.body.password, 12);

        await prisma.user.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                mobile_number: req.body.mobileNumber,
                blood_group: req.body.bloodGroup,
                password: hash
            }
        });

        return res.status(200).json({
            data: {
                message: "Account created successfully, continue to login."}
            }
        );
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.resetPassword = async (req, res, next) => {
    
}