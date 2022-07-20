-- role = 0 => PARTICIPANT, role = 1 => ADMINISTRATOR 
CREATE TABLE User (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
    name VARCHAR(100),
    mobile_number VARCHAR(20),
    blood_group VARCHAR(5),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(256),
    role INT NOT NULL DEFAULT 0,
    active INT NOT NULL,
    CONSTRAINT pk_user_id PRIMARY KEY (id)
);

-- cancelled = 0 => NO, role = 1 => YES
CREATE TABLE Tournament (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    sport VARCHAR(100) NOT NULL,
    description VARCHAR(200) NOT NULL,
    team_size INT NOT NULL CHECK(team_size >= 1),
    cancelled INT NOT NULL DEFAULT 0,
    event_date VARCHAR(100) NOT NULL,
    deadline_date VARCHAR(100) NOT NULL,
    CONSTRAINT pk_tournament PRIMARY KEY (id)
);

-- result = 0 => REGISTERED, status = 1 => DISQUALIFIED, status = 2 => LOST, status = 3 => WINNER, status = 4 => NOT PARTICIPATED
CREATE TABLE Team (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    size INT NOT NULL,
    result INT NOT NULL DEFAULT 0,
    tournament_id INT NOT NULL,
    leader_id INT NOT NULL,
    CONSTRAINT pk_team PRIMARY KEY (id),
	CONSTRAINT fk_team_tournament FOREIGN KEY (tournament_id) REFERENCES Tournament(id),
    CONSTRAINT fk_team_user FOREIGN KEY (leader_id) REFERENCES User(id)
);

CREATE TABLE Member (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
	email VARCHAR(100) NOT NULL,
    team_id INT NOT NULL,
    tournament_id INT NOT NULL,
    CONSTRAINT pk_member PRIMARY KEY (id),
    CONSTRAINT fk_member_user FOREIGN KEY (email) REFERENCES User(email),
    CONSTRAINT fk_member_team FOREIGN KEY (team_id) REFERENCES Team(id),
    CONSTRAINT fk_member_tournament FOREIGN KEY (tournament_id) REFERENCES Tournament(id),
    CONSTRAINT uc_member UNIQUE (tournament_id, email)
);

