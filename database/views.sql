CREATE VIEW commuters_view AS
SELECT flight_id, airline_id, status, source, destination, arrival, departure, price, date, runway_no
FROM Flights;

