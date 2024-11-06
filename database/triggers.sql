-- Trigger1 -> to decrease available seats when ticket is booked
CREATE TRIGGER decrease_seats
AFTER INSERT ON ticket
FOR EACH ROW
UPDATE Flights
SET available_seats = available_seats - 1
WHERE Flights.flight_id = NEW.flight_id;

-- Trigger2 -> to prevent overbooking
DELIMITER $$

CREATE TRIGGER prevent_overbooking
BEFORE INSERT ON ticket
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

-- Trigger3 -> solves runway conflicts
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
