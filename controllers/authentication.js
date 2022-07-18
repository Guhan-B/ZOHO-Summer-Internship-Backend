const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const { ServerError } = require("../utils/error");
const prisma = require("../utils/prisma");

exports.user = async (req, res, next) => {
    return res.status(200).json({data: { user: [req.user].map(({ password, ...rest }) => rest)[0] }});
}

exports.login = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        const error = {
            email: false, 
            password: false
        };

        err.array().forEach(e => error[e.param] = true);

        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', error));
    }

    try {
        const user = await prisma.user.findUnique({where: {email: req.body.email}});

        if(!user)
            return next(new ServerError('Email does not exist', 401, 'EMAIL_NOT_REGISTERED'));
        
        const isPasswordSame = await bcrypt.compare(req.body.password, user.password);

        if (!isPasswordSame) 
            return next(new ServerError('Password does not match', 401, 'WRONG_PASSWORD'));
        
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.ACCESS_TOKEN_KEY + user.password,
            {
                expiresIn: '24h'
            }
        );

        res.cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

        return res.status(200).json({
            data: { 
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    mobileNumber: user.mobile_number,
                    bloodGroup: user.blood_group,
                    role: user.role
                }
        }});
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.register = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        const error = {
            name: false, 
            mobileNumber: false, 
            bloodGroup: false, 
            email: false, 
            password: false
        };

        err.array().forEach(e => error[e.param] = true);

        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', error));
    }

    try {
        const user = await prisma.user.findUnique({ where: {email: req.body.email}});
        
        if(user)
            return next(new ServerError('Email already exist', 422, 'EMAIL_ALREADY_REGISTERED'));
        
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

        return res.status(200).json({ data: { message: "Account created successfully, continue to login." }});
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.logout = async (req, res, next) => {
    res.clearCookie("token", {maxAge: 0});
    return res.status(200).json({data: {message: "Logout successfull."}})
}

exports.resetPassword = async (req, res, next) => {
    
}