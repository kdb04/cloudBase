-- Function1
DELIMITER $$

CREATE DEFINER=`root`@`localhost` PROCEDURE `alternative`(IN cancelled_flight_id BIGINT)
BEGIN
   DECLARE cancelled_destination VARCHAR(50);
   DECLARE cancelled_source VARCHAR(50);
   DECLARE alt_price BIGINT;

   SELECT source, destination, price INTO cancelled_source, cancelled_destination, alt_price
   FROM Flights
   WHERE flight_id = cancelled_flight_id;

   SELECT flight_id, airline_id, departure, arrival, available_seats, price
   FROM Flights
   WHERE source = cancelled_source
     AND destination = cancelled_destination
     AND available_seats > 0
     AND flight_id != cancelled_flight_id
     AND status != 'canceled'
     AND status != "air"
   ORDER BY price ASC;

END$$

DELIMITER ;

-- Function2
CREATE DEFINER=`root`@`localhost` PROCEDURE `dynamic_pricing`(flightid bigint)
BEGIN
declare base bigint;
declare seats bigint;
declare new_price bigint;
select price, available_seats into base,seats from Flights where flightid=flight_id;

if seats<=5 then
	set new_price=base*1.20;

elseif seats<=10 then
	set new_price=base*1.10;
else
	set new_price=base;
END if;

update Flights set price=new_price where flightid=flight_id;
END;
//

-- Function3
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
