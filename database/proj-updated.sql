CREATE TABLE airlines (
    airline_id INT PRIMARY KEY,
    airline_name VARCHAR(50),
    airport_name VARCHAR(50)
);

CREATE TABLE airport (
    airport_name VARCHAR(50) PRIMARY KEY,
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50)
);

CREATE TABLE bus(
    airport_name VARCHAR(50),
    number_plate BIGINT PRIMARY KEY,
    status VARCHAR(20),
    destination VARCHAR(50),
    start_time TIME
    FOREIGN KEY(airport_name) references airport(airport_name)
);

CREATE TABLE commuters(
    passenger_no BIGINT PRIMARY KEY,
    passport_no BIGINT,
    fname VARCHAR(50),
    mname VARCHAR(50),
    lname VARCHAR(50),
    age BIGINT,
    airport_name VARCHAR(50)
    FOREIGN KEY(airport_name) references airport(airport_name)
);


CREATE TABLE commuter_phone(
    passenger_no BIGINT,
    phone_no BIGINT
    FOREIGN KEY(passenger_no) references commuters(passenger_no)
);

CREATE TABLE flights(
    flight_id BIGINT PRIMARY KEY,
    airline_id BIGINT,
    status VARCHAR(20),
    source VARCHAR(40),
    destination VARCHAR(40),
    arrival TIME,
    departure TIME,
    available_seats INT,
    price BIGINT,
    date DATE,
    runway_no INT
    FOREIGN KEY(airline_id) references airlines(airline_id)
);

CREATE TABLE staff(
    id BIGINT PRIMARY KEY,
    airport_name VARCHAR(50),
    salary BIGINT,
    domain VARCHAR(30),
    age BIGINT,
    gender CHAR(1),
    fname VARCHAR(40),
    mname VARCHAR(40),
    lname VARCHAR(40)
    FOREIGN KEY(airport_name) references airport(airport_name)
);

CREATE TABLE staff_phone(
    id BIGINT,
    phone BIGINT,
    FOREIGN KEY(id) references staff(id)
);

CREATE TABLE stalls(
    airport_name VARCHAR(50),
    stall_id BIGINT PRIMARY KEY,
    name VARCHAR(40),
    owner_name VARCHAR(40)
    FOREIGN KEY(airport_name) references airport(airport_name)
);

CREATE TABLE ticket(
    ticket_id BIGINT PRIMARY KEY,
    passenger_no BIGINT,
    class VARCHAR(20),
    food_preference VARCHAR(20),
    source VARCHAR(40),
    destination VARCHAR(40),
    seat_no BIGINT,
    flight_id BIGINT,
    FOREIGN KEY(flight_id) references flights(flight_id)
    FOREIGN KEY(passenger_no) references commuters(passenger_no)
);

CREATE TABLE users (
    user_id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id)
);


CREATE TABLE blacklisted_emails(
    b_emails VARCHAR(255) PRIMARY KEY
);

INSERT INTO blacklisted_emails (b_emails)
VALUES 
    ('xrumer888@outlook.com'),
    ('noreplyhere@aol.com'),
    ('ericjonesmyemail@gmail.com'),
    ('mikexxxx@gmail.com'),
    ('ibucezevuda439@gmail.com'),
    ('yourmail@gmail.com')
    ('mitaxebandilis@gmail.com')
    ('morrismi1@outlook.com')
    ('blaster@growwealthy.info')
    ('blaster@nowbusiness.info')
    ('leadingai@greatbusi.info')
    ('freelancerproai@getprofitnow.info')
    ('help@gwmetabitt.com')
    ('jamescook312@outlook.com')
    ('info@professionalseocleanup.com')
    ('axobajigufo34@gmail.com')
    ('freelancerproai@moredollar.info')
    ;

--triggers : 

DELIMITER //
CREATE TRIGGER prevent_runway_conflict
BEFORE INSERT ON Flights
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT;

   
    SELECT COUNT(*) INTO conflict_count
    FROM Flights
    WHERE runway_no = NEW.runway_no
      AND date = NEW.date
      AND flight_id <> NEW.flight_id
      AND ABS(TIMESTAMPDIFF(MINUTE, NEW.departure, departure)) < 30;

   
    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Schedule conflict: Another flight is assigned to the same runway within 30 minutes.';
    END IF;
END;
//
DELIMITER ;

CREATE TRIGGER decrease_seats
AFTER INSERT ON Ticket
FOR EACH ROW
UPDATE Flights
SET available_seats = available_seats - 1
WHERE Flights.flight_id = NEW.flight_id; 



DELIMITER $$
CREATE TRIGGER prevent_overbooking
BEFORE INSERT ON Ticket
FOR EACH ROW
BEGIN
   DECLARE seat_count INT;

   SELECT available_seats INTO seat_count 
   FROM Flights 
   WHERE flight_id = NEW.flight_id;

   IF seat_count <= 0 THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Flight is fully booked. No more tickets available.';
   END IF;
END$$

DELIMITER ;


--functions : 

CREATE DEFINER=`root`@`localhost` PROCEDURE `alternative`(IN cancelled_flight_id BIGINT, IN departure_date date)
BEGIN
declare cancelled_destination varchar(50);
declare cancelled_source varchar(50);
declare alt_price bigint;
select source, destination, price into cancelled_source, cancelled_destination, alt_price from flights where flight_id=cancelled_flight_id;
select flight_id, airline_id , departure,arrival ,available_seats, price from flights where source=cancelled_source and destination=cancelled_destination and available_seats>0 and flight_id!=cancelled_flight_id and status!='canceled' and status!="air"
order by price asc;
END


CREATE DEFINER=`root`@`localhost` PROCEDURE `dynamic_pricing`(flightid bigint)
BEGIN
declare base bigint;
declare seats bigint;
declare new_price bigint;
select price, available_seats into base,seats from flights where flightid=flight_id;

if seats<=5 then
	set new_price=base*1.20;
    
elseif seats<=10 then
	set new_price=base*1.10;
else
	set new_price=base;
END if;
    
update flights set price=new_price where flightid=flight_id;
END

DELIMITER //
CREATE PROCEDURE GetBlacklistedUsers()
BEGIN
    SELECT 
        u.name,
        u.email,
    FROM 
        users u INNER JOIN blacklisted_emails b ON u.email = b.b_emails;
END //
DELIMITER ;