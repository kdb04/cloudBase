-- Procedure 1: find alternative flights for a cancelled booking
DELIMITER $$

CREATE DEFINER=`root`@`localhost` PROCEDURE `alternative`(IN cancelled_flight_id BIGINT)
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

DELIMITER ;

-- Procedure 2: dynamic pricing based on remaining seat availability
DELIMITER $$

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

-- Procedure 3: list users whose email is blacklisted
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
