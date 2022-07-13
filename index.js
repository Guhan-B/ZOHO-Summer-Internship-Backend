const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');

const errorHandler = require("./middlewares/error");
const accessHandler = require("./middlewares/authentication");
const authenticationRoutes = require("./routes/authentication");
const administratorRoutes = require("./routes/administrator");
const participantRoutes = require("./routes/participant");

dotenv.config();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use("/authentication", authenticationRoutes);
app.use("/administrator", accessHandler(1), administratorRoutes);

app.use(errorHandler());

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`[SUCCESS] server is running at ${PORT}`);
});

/*
Authentication
- register
- login
- reset password

Participant
- fetch avaliable tournaments
- fetch registered tournaments
- apply tournament
- edit profile

Administrator
- fetch tournaments
- fetch tournament
- create tournament
- cancel tournament
- edit tournament
- update result
*/