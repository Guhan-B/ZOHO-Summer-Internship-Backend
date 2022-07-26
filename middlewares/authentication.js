const jwt = require('jsonwebtoken');
const JwtDecode = require("jwt-decode");

const { ServerError } = require('../utils/error');
const prisma = require('../utils/prisma');

module.exports = (role) => async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return next(new ServerError('Access token Missing', 401, 'AUTHENTICATION_FAILED'));
    }

    try {
        const decoded = JwtDecode(token);

        const user = await prisma.user.findUnique({ where: {id: decoded.id}});
        const DBToken = await prisma.token.findUnique({ where: {userId: decoded.id}});

        if(token !== DBToken.token)
            return next(new ServerError('Token error - Token Invalid', 401, 'AUTHENTICATION_FAILED'));
            
        jwt.verify(token, process.env.ACCESS_TOKEN_KEY + user.password, async (err) => {
            if (err) {
                return next(new ServerError("Token error - " + err.message, 401, 'AUTHENTICATION_FAILED'));
            } else {
                if(!role.includes(user.role))
                    return next(new ServerError('Access Denied', 401, 'AUTHENTICATION_FAILED'));

                req.user = user;
                
                next();
            }
        });
    }
    catch(e) {
        if(e instanceof JwtDecode.InvalidTokenError)
            return next(new ServerError('Token error - Invalid access token', 401, 'AUTHENTICATION_FAILED'));
        else {
            console.log(e);
            return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
        }
    }


}