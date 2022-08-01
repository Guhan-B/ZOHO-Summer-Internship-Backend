const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");

exports.generateToken = async (payload, secret) => {
    const id = uuid.v4();
    const value = jwt.sign({ ...payload, tid: id }, secret, { expiresIn: "24h", algorithm: "HS256" });
    const hash = await bcrypt.hash(value, 12);

    return { id, value, hash };
}

const generateRandomNumber = (max) => {
    return Math.floor(Math.random() * max);
}
  