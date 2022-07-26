const jwt = require('jsonwebtoken');
const JwtDecode = require("jwt-decode");
const bcrypt = require("bcrypt");

const { ServerError } = require('../utils/error');
const prisma = require('../utils/prisma');

module.exports = (role) => async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) 
        return next(new ServerError('Access token missing', 401, 'AUTHENTICATION_FAILED'));

    try {
        const decoded = JwtDecode(token);

        const userResult = await prisma.user.findUnique({where: { id: decoded.uid }});
        const tokenResult = await prisma.token.findUnique({where: { id: decoded.tid }});
        
        if(!userResult || !tokenResult)
            return next(new ServerError('Token error - Invalid access token', 401, 'AUTHENTICATION_FAILED'));

        jwt.verify(token, process.env.SECRET_KEY + userResult.password, { algorithms: ["HS256"] }, async (error) => {
            if (error) {
                return next(new ServerError("Token error - " + error.message, 401, 'AUTHENTICATION_FAILED'));
            } else {
                const isTokenSame = await bcrypt.compare(token, tokenResult.token);

                if(!isTokenSame)
                    return next(new ServerError('Token error - Invalid access token', 401, 'AUTHENTICATION_FAILED'));
                if(!role.includes(userResult.role))

                    return next(new ServerError('Access Denied', 401, 'AUTHENTICATION_FAILED'));
                    
                req.user = userResult;
                req.token = tokenResult;

                next();
            }
        });
    }
    catch(e) {
        if(e instanceof JwtDecode.InvalidTokenError) {
            return next(new ServerError('Token error - Invalid access token', 401, 'AUTHENTICATION_FAILED'));
        }
        else {
            console.log(e);
            return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
        }
    }
}
