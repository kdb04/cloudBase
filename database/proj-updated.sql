-- users first: ticket and commuters will FK to it
CREATE TABLE users (
    user_id  INT NOT NULL AUTO_INCREMENT,
    email    VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name     VARCHAR(100) NULL,
    role     ENUM('user','admin','staff') NOT NULL DEFAULT 'user',
    PRIMARY KEY (user_id)
);

CREATE TABLE airlines (
    airline_id   INT PRIMARY KEY,
    airline_name VARCHAR(50),
    airport_name VARCHAR(50)
);

CREATE TABLE airport (
    airport_name VARCHAR(50) PRIMARY KEY,
    city         VARCHAR(50),
    state        VARCHAR(50),
    country      VARCHAR(50)
);

CREATE TABLE bus (
    airport_name VARCHAR(50),
    number_plate BIGINT PRIMARY KEY,
    status       VARCHAR(20),
    destination  VARCHAR(50),
    start_time   TIME,
    FOREIGN KEY (airport_name) REFERENCES airport(airport_name)
);

CREATE TABLE commuters (
    passenger_no BIGINT PRIMARY KEY,
    passport_no  BIGINT,
    fname        VARCHAR(50),
    mname        VARCHAR(50),
    lname        VARCHAR(50),
    age          BIGINT,
    airport_name VARCHAR(50),
    user_id      INT NULL,
    FOREIGN KEY (airport_name) REFERENCES airport(airport_name),
    FOREIGN KEY (user_id)      REFERENCES users(user_id)
);

CREATE TABLE commuter_phone (
    passenger_no BIGINT,
    phone_no     BIGINT,
    FOREIGN KEY (passenger_no) REFERENCES commuters(passenger_no)
);

CREATE TABLE flights (
    flight_id       BIGINT PRIMARY KEY,
    airline_id      BIGINT,
    status          VARCHAR(20),
    source          VARCHAR(40),
    destination     VARCHAR(40),
    arrival         TIME,
    departure       TIME,
    available_seats INT,
    price           BIGINT,
    date            DATE,
    runway_no       INT,
    stops           INT NOT NULL DEFAULT 0,
    FOREIGN KEY (airline_id) REFERENCES airlines(airline_id)
);

CREATE TABLE staff (
    id           BIGINT PRIMARY KEY,
    airport_name VARCHAR(50),
    salary       BIGINT,
    domain       VARCHAR(30),
    age          BIGINT,
    gender       CHAR(1),
    fname        VARCHAR(40),
    mname        VARCHAR(40),
    lname        VARCHAR(40),
    FOREIGN KEY (airport_name) REFERENCES airport(airport_name)
);

CREATE TABLE staff_phone (
    id    BIGINT,
    phone BIGINT,
    FOREIGN KEY (id) REFERENCES staff(id)
);

CREATE TABLE stalls (
    airport_name VARCHAR(50),
    stall_id     BIGINT PRIMARY KEY,
    name         VARCHAR(40),
    owner_name   VARCHAR(40),
    FOREIGN KEY (airport_name) REFERENCES airport(airport_name)
);

CREATE TABLE ticket (
    ticket_id       BIGINT PRIMARY KEY,
    passenger_no    BIGINT,
    class           VARCHAR(20),
    food_preference VARCHAR(20),
    source          VARCHAR(40),
    destination     VARCHAR(40),
    seat_no         BIGINT,
    flight_id       BIGINT,
    user_id         INT NULL,
    FOREIGN KEY (flight_id)    REFERENCES flights(flight_id),
    FOREIGN KEY (passenger_no) REFERENCES commuters(passenger_no),
    FOREIGN KEY (user_id)      REFERENCES users(user_id)
);

CREATE TABLE blacklisted_emails (
    b_emails VARCHAR(255) PRIMARY KEY
);

-- Loyalty points: one row per user, tier auto-managed by app layer
-- Bronze <1000, Silver <5000, Gold <10000, Platinum 10000+
CREATE TABLE loyalty_points (
    loyalty_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id    INT NOT NULL UNIQUE,
    points     INT NOT NULL DEFAULT 0,
    tier       ENUM('Bronze','Silver','Gold','Platinum') NOT NULL DEFAULT 'Bronze',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Audit log of points earned/redeemed per booking
CREATE TABLE point_transactions (
    pt_id           INT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT NOT NULL,
    ticket_id       BIGINT NULL,
    points_earned   INT NOT NULL DEFAULT 0,
    points_redeemed INT NOT NULL DEFAULT 0,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)   REFERENCES users(user_id),
    FOREIGN KEY (ticket_id) REFERENCES ticket(ticket_id) ON DELETE SET NULL
);

-- Waitlist for fully-booked flights; confirmed by increase_seats trigger
CREATE TABLE waitlist (
    waitlist_id  INT PRIMARY KEY AUTO_INCREMENT,
    user_id      INT NOT NULL,
    flight_id    BIGINT NOT NULL,
    class        VARCHAR(20) NULL,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status       ENUM('waiting','confirmed','cancelled','expired') NOT NULL DEFAULT 'waiting',
    FOREIGN KEY (user_id)   REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id) ON DELETE CASCADE
);


INSERT INTO blacklisted_emails (b_emails) VALUES
    ('xrumer888@outlook.com'),
    ('noreplyhere@aol.com'),
    ('ericjonesmyemail@gmail.com'),
    ('mikexxxx@gmail.com'),
    ('ibucezevuda439@gmail.com'),
    ('yourmail@gmail.com'),
    ('mitaxebandilis@gmail.com'),
    ('morrismi1@outlook.com'),
    ('blaster@growwealthy.info'),
    ('blaster@nowbusiness.info'),
    ('leadingai@greatbusi.info'),
    ('freelancerproai@getprofitnow.info'),
    ('help@gwmetabitt.com'),
    ('jamescook312@outlook.com'),
    ('info@professionalseocleanup.com'),
    ('axobajigufo34@gmail.com'),
    ('freelancerproai@moredollar.info');

-- Payment fields added to ticket post-creation
ALTER TABLE ticket ADD COLUMN transaction_id  VARCHAR(255);
ALTER TABLE ticket ADD COLUMN payment_status  VARCHAR(50) DEFAULT 'Pending';
ALTER TABLE ticket ADD COLUMN amount_paid     DECIMAL(10,2);

UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';


-- indexes --

CREATE INDEX idx_ticket_user     ON ticket(user_id);
CREATE INDEX idx_ticket_flight   ON ticket(flight_id);
CREATE INDEX idx_waitlist_flight ON waitlist(flight_id, status);
CREATE INDEX idx_flights_route   ON flights(source, destination, date);
CREATE INDEX idx_point_tx_user   ON point_transactions(user_id);


-- triggers --

DELIMITER //

CREATE TRIGGER prevent_runway_conflict
BEFORE INSERT ON flights
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT;

    SELECT COUNT(*) INTO conflict_count
    FROM flights
    WHERE runway_no    = NEW.runway_no
      AND date         = NEW.date
      AND flight_id   <> NEW.flight_id
      AND ABS(TIMESTAMPDIFF(MINUTE, NEW.departure, departure)) < 30;

    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Schedule conflict: Another flight is assigned to the same runway within 30 minutes.';
    END IF;
END //

DELIMITER ;

CREATE TRIGGER decrease_seats
AFTER INSERT ON ticket
FOR EACH ROW
UPDATE flights
SET available_seats = available_seats - 1
WHERE flights.flight_id = NEW.flight_id;

DELIMITER $$

CREATE TRIGGER prevent_overbooking
BEFORE INSERT ON ticket
FOR EACH ROW
BEGIN
    DECLARE seat_count INT;

    SELECT available_seats INTO seat_count
    FROM flights
    WHERE flight_id = NEW.flight_id;

    IF seat_count <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Flight is fully booked. No more tickets available.';
    END IF;
END$$

-- Restore seat on cancellation and auto-confirm oldest waiting waitlist entry
CREATE TRIGGER increase_seats
AFTER DELETE ON ticket
FOR EACH ROW
BEGIN
    DECLARE next_waitlist INT;
    DECLARE next_user     INT;

    UPDATE flights
    SET available_seats = available_seats + 1
    WHERE flight_id = OLD.flight_id;

    SELECT waitlist_id, user_id INTO next_waitlist, next_user
    FROM waitlist
    WHERE flight_id = OLD.flight_id AND status = 'waiting'
    ORDER BY requested_at ASC
    LIMIT 1;

    IF next_waitlist IS NOT NULL THEN
        UPDATE waitlist SET status = 'confirmed' WHERE waitlist_id = next_waitlist;
    END IF;
END$$

DELIMITER ;


-- procedures --

DELIMITER $$

CREATE DEFINER=`root`@`localhost` PROCEDURE `alternative`(
    IN cancelled_flight_id BIGINT,
    IN departure_date      DATE
)
BEGIN
    DECLARE cancelled_destination VARCHAR(50);
    DECLARE cancelled_source      VARCHAR(50);
    DECLARE alt_price             BIGINT;

    SELECT source, destination, price
    INTO   cancelled_source, cancelled_destination, alt_price
    FROM   flights
    WHERE  flight_id = cancelled_flight_id;

    SELECT flight_id, airline_id, departure, arrival, available_seats, price
    FROM   flights
    WHERE  source          = cancelled_source
      AND  destination     = cancelled_destination
      AND  available_seats > 0
      AND  flight_id      != cancelled_flight_id
      AND  status         != 'canceled'
      AND  status         != 'air'
    ORDER BY price ASC;
END$$

-- Parameter renamed to p_flight_id to avoid WHERE clause collision with column name
CREATE DEFINER=`root`@`localhost` PROCEDURE `dynamic_pricing`(IN p_flight_id BIGINT)
BEGIN
    DECLARE base      BIGINT;
    DECLARE seats     BIGINT;
    DECLARE new_price BIGINT;

    SELECT price, available_seats INTO base, seats
    FROM   flights
    WHERE  flight_id = p_flight_id;

    IF seats <= 5 THEN
        SET new_price = base * 1.20;
    ELSEIF seats <= 10 THEN
        SET new_price = base * 1.10;
    ELSE
        SET new_price = base;
    END IF;

    UPDATE flights SET price = new_price WHERE flight_id = p_flight_id;
END$$

DELIMITER ;

DELIMITER //

CREATE PROCEDURE GetBlacklistedUsers()
BEGIN
    SELECT
        u.name,
        u.email
    FROM
        users u INNER JOIN blacklisted_emails b ON u.email = b.b_emails;
END //

DELIMITER ;
