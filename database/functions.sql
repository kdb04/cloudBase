-- Function1
CREATE DEFINER=`root`@`localhost` PROCEDURE `alternative`(IN cancelled_flight_id BIGINT, IN departure_date date)
BEGIN
declare cancelled_destination varchar(50);
declare cancelled_source varchar(50);
declare alt_price bigint;
select source, destination, price into cancelled_source, cancelled_destination, alt_price from Flights where flight_id=cancelled_flight_id;
select flight_id, airline_id , departure,arrival ,available_seats, price from Flights where source=cancelled_source and destination=cancelled_destination and available_seats>0 and flight_id!=cancelled_flight_id and status!='canceled' and status!="air"
order by price asc;
END;
//

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

