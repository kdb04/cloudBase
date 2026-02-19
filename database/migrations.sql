-- migrations.sql 

-- 1. users 

ALTER TABLE users ADD COLUMN name VARCHAR(100) NULL;

UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';


-- 2. ticket 

ALTER TABLE ticket ADD COLUMN user_id INT NULL;

ALTER TABLE ticket
    ADD CONSTRAINT fk_ticket_user FOREIGN KEY (user_id) REFERENCES users(user_id);


-- 3. commuters 

ALTER TABLE commuters ADD COLUMN user_id INT NULL;

ALTER TABLE commuters
    ADD CONSTRAINT fk_commuters_user FOREIGN KEY (user_id) REFERENCES users(user_id);


-- 4. flights 

ALTER TABLE flights ADD COLUMN stops INT NOT NULL DEFAULT 0;


-- 5. New tables 

CREATE TABLE IF NOT EXISTS loyalty_points (
    loyalty_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id    INT NOT NULL UNIQUE,
    points     INT NOT NULL DEFAULT 0,
    tier       ENUM('Bronze','Silver','Gold','Platinum') NOT NULL DEFAULT 'Bronze',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS point_transactions (
    pt_id           INT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT NOT NULL,
    ticket_id       BIGINT NULL,
    points_earned   INT NOT NULL DEFAULT 0,
    points_redeemed INT NOT NULL DEFAULT 0,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)   REFERENCES users(user_id),
    FOREIGN KEY (ticket_id) REFERENCES ticket(ticket_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS waitlist (
    waitlist_id  INT PRIMARY KEY AUTO_INCREMENT,
    user_id      INT NOT NULL,
    flight_id    BIGINT NOT NULL,
    class        VARCHAR(20) NULL,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status       ENUM('waiting','confirmed','cancelled','expired') NOT NULL DEFAULT 'waiting',
    FOREIGN KEY (user_id)   REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id) ON DELETE CASCADE
);


-- 6. increase_seats trigger

DROP TRIGGER IF EXISTS increase_seats;

DELIMITER $$

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


-- 7. Fix dynamic_pricing 

DROP PROCEDURE IF EXISTS dynamic_pricing;

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


-- 8. Fix GetBlacklistedUsers

DROP PROCEDURE IF EXISTS GetBlacklistedUsers;

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


-- 9. Indexes 

CREATE INDEX idx_ticket_user     ON ticket(user_id);
CREATE INDEX idx_ticket_flight   ON ticket(flight_id);
CREATE INDEX idx_waitlist_flight ON waitlist(flight_id, status);
CREATE INDEX idx_flights_route   ON flights(source, destination, date);
CREATE INDEX idx_point_tx_user   ON point_transactions(user_id);
