-- role = 0 => PARTICIPANT, role = 1 => ADMINISTRATOR 
CREATE TABLE User (
	id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(256) NOT NULL,
    role INT NOT NULL DEFAULT 0,
    CONSTRAINT pk_user PRIMARY KEY (id)
);

-- cancelled = 0 => NO, role = 1 => YES
CREATE TABLE Tournament (
	id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    sport VARCHAR(100) NOT NULL,
    description VARCHAR(100) NOT NULL,
    team_size INT NOT NULL CHECK(team_size >= 1),
    cancelled INT NOT NULL DEFAULT 0,
    event_date VARCHAR(100) NOT NULL,
    deadline_date VARCHAR(100) NOT NULL,
    CONSTRAINT pk_tournament PRIMARY KEY (id)
);

-- status = 0 => REGISTERED, status = 1 => DISQUALIFIED, status = 2 => LOST, status = 3 => WINNER, status = 4 => CANCELLED
CREATE TABLE Team (
	id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    size INT NOT NULL,
    status INT NOT NULL DEFAULT 0,
    tournamentId INT NOT NULL,
    CONSTRAINT pk_team PRIMARY KEY (id),
	CONSTRAINT fk_team_tournament FOREIGN KEY (tournamentId) REFERENCES Tournament(id)
);

-- type = 0 => normal, type = 1 => leader 
CREATE TABLE Member (
	id INT AUTO_INCREMENT,
	userId INT NOT NULL,
    teamId INT NOT NULL,
    tournamentId INT NOT NULL,
    type INT NOT NULL,
    CONSTRAINT pk_member PRIMARY KEY (id),
    CONSTRAINT fk_member_user FOREIGN KEY (userId) REFERENCES User(id),
    CONSTRAINT fk_member_team FOREIGN KEY (teamId) REFERENCES Team(id),
    CONSTRAINT fk_member_tournament FOREIGN KEY (tournamentId) REFERENCES Tournament(id),
    CONSTRAINT uc_member UNIQUE (tournamentId, userId)
);

