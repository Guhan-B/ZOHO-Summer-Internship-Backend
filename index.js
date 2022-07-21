const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cookieParser = require("cookie-parser");

const errorHandler = require("./middlewares/error");
const accessHandler = require("./middlewares/authentication");
const authenticationRoutes = require("./routes/authentication");
const administratorRoutes = require("./routes/administrator");
const participantRoutes = require("./routes/participant");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({credentials: true, origin: "http://localhost:3000"}));
app.use(cookieParser());

app.use("/authentication", authenticationRoutes);
app.use("/administrator", accessHandler([1]), administratorRoutes);
app.use("/participant", accessHandler([0]), participantRoutes);

app.use(errorHandler());

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`[SUCCESS] server is running at ${PORT}`);
});