-- Trigger1: decrement available seats when a ticket is booked
CREATE TRIGGER decrease_seats
AFTER INSERT ON ticket
FOR EACH ROW
UPDATE flights
SET available_seats = available_seats - 1
WHERE flights.flight_id = NEW.flight_id;

-- Trigger2: prevent overbooking
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

-- Trigger3: restore seat on cancellation; auto-confirm oldest waiting waitlist entry
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

-- Trigger4: prevent runway scheduling conflicts (within 30 minutes)
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
