const csurf = require("csurf");
const { ServerError } = require("../utils/error");

const csurfInstance = csurf({ cookie: { httpOnly: true, secure: false } });

module.exports = (req, res, next) => {
    csurfInstance(req, res, (err) => {
        const SKIP = ["/authentication/login", "/authentication/register", "/authentication/user"];

        if(req.method === "GET" || SKIP.includes(req.path)) {
            next();
        }
        else {
            if(err && err.code === "EBADCSRFTOKEN")
                next(new ServerError("Access Denied - Bad CSRF Token", 405, err.code));
            else
                next();
        }
    });
}