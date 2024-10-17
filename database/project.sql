create database ams;
use ams;

CREATE TABLE Airport (
    airport_name VARCHAR(255) PRIMARY KEY,
    city VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(255)
);

CREATE TABLE Staff (
    id BIGINT PRIMARY KEY,
    airport_name VARCHAR(255),
    salary BIGINT,
    domain VARCHAR(255),
    age BIGINT,
    gender CHAR(1),
    fname VARCHAR(255),
    mname VARCHAR(255),
    lname VARCHAR(255),
    FOREIGN KEY (airport_name) REFERENCES Airport(airport_name)
);

CREATE TABLE Staff_Phone (
    id BIGINT,
    phone BIGINT,
    FOREIGN KEY (id) REFERENCES Staff(id)
);

CREATE TABLE Commuters (
    passenger_no BIGINT PRIMARY KEY,
    passport_no BIGINT,
    fname VARCHAR(255),
    mname VARCHAR(255),
    lname VARCHAR(255),
    age BIGINT,
    airport_name VARCHAR(255),
    FOREIGN KEY (airport_name) REFERENCES Airport(airport_name)
);


CREATE TABLE Commuter_Phone (
    passenger_no BIGINT,
    phone_no BIGINT,
    FOREIGN KEY (passenger_no) REFERENCES Commuters(passenger_no));



CREATE TABLE Ticket (
    ticket_id BIGINT PRIMARY KEY,
    passenger_no BIGINT,
    class VARCHAR(255),
    food_preference VARCHAR(255),
    date DATE,
    source VARCHAR(255),
    destination VARCHAR(255),
    seat_no BIGINT,
    FOREIGN KEY (passenger_no) REFERENCES Commuters(passenger_no)
);

CREATE TABLE Bus (
    airport_name VARCHAR(255),
    number_plate BIGINT PRIMARY KEY,
    status VARCHAR(255),
    destination VARCHAR(255),
    start_time TIME,
    FOREIGN KEY (airport_name) REFERENCES Airport(airport_name)
);

ALTER TABLE Flights
ADD available_seats INT;

ALTER TABLE Ticket
ADD flight_id BIGINT;

ALTER TABLE Ticket
ADD CONSTRAINT fk_flight
FOREIGN KEY (flight_id)
REFERENCES Flights(flight_id);


#triggers:

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
