const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

const prisma = require("../utils/prisma");
const { ServerError } = require("../utils/error");
const { generateToken } = require("../utils/token");

exports.user = async (req, res, next) => {
    return res.status(200).json({
        data: { 
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                mobileNumber: req.user.mobile_number,
                bloodGroup: req.user.blood_group,
                role: req.user.role
            }
        }
    });
}

exports.login = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        const error = { email: { value: false, message: "" }, password: { value: false, message: "" } };
        err.array().forEach(e => error[e.param] = { value: true, message: e.msg });
        return next(new ServerError('One or More inputs in invalid', 422, 'VALIDATION_FAILED', error));
    }

    try {
        const user = await prisma.user.findUnique({where: {email: req.body.email}});

        if(!user || user.active === 0) {
            const error = { email: { value: true, message: "Email is not registered" } };
            return next(new ServerError('Email is not registered', 422, 'VALIDATION_FAILED', error));
        }
        
        const isPasswordSame = await bcrypt.compare(req.body.password, user.password);

        if (!isPasswordSame) {
            const error = { password: { value: true, message: "Password does not match" } };
            return next(new ServerError('Password does not match', 422, 'VALIDATION_FAILED', error));
        }

        const token = await generateToken({ uid: user.id }, process.env.SECRET_KEY + user.password)

        await prisma.token.create({
            data: {
                id: token.id,
                user_id: user.id,
                token: token.hash,
                created_at: new Date().toUTCString() 
            }
        });

        res.cookie("token", token.value, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

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
            email: { value: false, message: "" }, 
            password: { value: false, message: "" },
            name: { value: false, message: "" },
            bloodGroup: { value: false, message: "" },
            mobileNumber: { value: false, message: "" },
        };
        err.array().forEach(e => error[e.param] = { value: true, message: e.msg });
        return next(new ServerError('One or more inputs in invalid', 422, 'VALIDATION_FAILED', error));
    }

    try {
        const user = await prisma.user.findUnique({ where: {email: req.body.email}});
        
        if(user && user.active === 1) {
            const error = { email: { value: true, message: "Email is already registered" } };
            return next(new ServerError('Email is already registered', 422, 'VALIDATION_FAILED', error));
        }
        
        const hash = await bcrypt.hash(req.body.password, 12);

        if(user) {
            await prisma.user.update({
                where: {
                    email: req.body.email
                },
                data: {
                    name: req.body.name,
                    mobile_number: req.body.mobileNumber,
                    blood_group: req.body.bloodGroup,
                    password: hash,
                    active: 1
                }
            });
        }
        else {
            await prisma.user.create({
                data: {
                    name: req.body.name,
                    email: req.body.email,
                    mobile_number: req.body.mobileNumber,
                    blood_group: req.body.bloodGroup,
                    password: hash,
                    active: 1
                }
            });
        }

        return res.status(200).json({ data: { message: "Account created successfully, continue to login" }});
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.logout = async (req, res, next) => {
    try {
        if(!req.body.all) {
            await prisma.token.delete({
                where: {
                    id: req.token.id
                }
            });
        }
        else {
            await prisma.token.deleteMany({
                where: {
                    user_id: req.user.id
                }
            });
        }
        res.clearCookie("token", {maxAge: 0});
        return res.status(200).json({data: {message: "You have been logged out successfully"}});
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.resetPassword = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        const error = { password: false };
        err.array().forEach(e => error[e.param] = true);
        return next(new ServerError('Password is invalid', 422, 'VALIDATION_FAILED', error));
    }

    try {
        const hash = await bcrypt.hash(req.body.password, 12);

        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hash }
        });

        await prisma.token.deleteMany({
            where: {
                user_id: req.user.id
            }
        });

        res.clearCookie("token", { maxAge: 0 });

        return res.status(200).json({data: {message: "Password changed successfully. Login to continue"}});
    }
    catch(e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}