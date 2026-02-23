-- migrations.sql 

-- 1. users

SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'name');
SET @sql = IF(@col = 0, 'ALTER TABLE users ADD COLUMN name VARCHAR(100) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';


-- 2. ticket

SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ticket' AND COLUMN_NAME = 'user_id');
SET @sql = IF(@col = 0, 'ALTER TABLE ticket ADD COLUMN user_id INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
           WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'ticket'
           AND CONSTRAINT_NAME = 'fk_ticket_user' AND CONSTRAINT_TYPE = 'FOREIGN KEY');
SET @sql = IF(@fk = 0,
    'ALTER TABLE ticket ADD CONSTRAINT fk_ticket_user FOREIGN KEY (user_id) REFERENCES users(user_id)',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- 3. commuters

SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'commuters' AND COLUMN_NAME = 'user_id');
SET @sql = IF(@col = 0, 'ALTER TABLE commuters ADD COLUMN user_id INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
           WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'commuters'
           AND CONSTRAINT_NAME = 'fk_commuters_user' AND CONSTRAINT_TYPE = 'FOREIGN KEY');
SET @sql = IF(@fk = 0,
    'ALTER TABLE commuters ADD CONSTRAINT fk_commuters_user FOREIGN KEY (user_id) REFERENCES users(user_id)',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- 4. flights

SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'flights' AND COLUMN_NAME = 'stops');
SET @sql = IF(@col = 0, 'ALTER TABLE flights ADD COLUMN stops INT NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


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

SET @i = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ticket'            AND INDEX_NAME = 'idx_ticket_user');
SET @sql = IF(@i = 0, 'CREATE INDEX idx_ticket_user ON ticket(user_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @i = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ticket'            AND INDEX_NAME = 'idx_ticket_flight');
SET @sql = IF(@i = 0, 'CREATE INDEX idx_ticket_flight ON ticket(flight_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @i = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'waitlist'          AND INDEX_NAME = 'idx_waitlist_flight');
SET @sql = IF(@i = 0, 'CREATE INDEX idx_waitlist_flight ON waitlist(flight_id, status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @i = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'flights'           AND INDEX_NAME = 'idx_flights_route');
SET @sql = IF(@i = 0, 'CREATE INDEX idx_flights_route ON flights(source, destination, date)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @i = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_transactions' AND INDEX_NAME = 'idx_point_tx_user');
SET @sql = IF(@i = 0, 'CREATE INDEX idx_point_tx_user ON point_transactions(user_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- 10. Flight status triggers

DROP TRIGGER IF EXISTS set_flight_status_on_insert;
DROP TRIGGER IF EXISTS set_flight_status_on_update;

DELIMITER $$

CREATE TRIGGER set_flight_status_on_insert
BEFORE INSERT ON flights
FOR EACH ROW
BEGIN
    IF NEW.status != 'canceled' THEN
        SET NEW.status = CASE
            WHEN NEW.date < CURDATE()                                                          THEN 'completed'
            WHEN NEW.date = CURDATE() AND CURTIME() > NEW.arrival                             THEN 'completed'
            WHEN NEW.date = CURDATE() AND CURTIME() BETWEEN NEW.departure AND NEW.arrival     THEN 'in air'
            ELSE 'scheduled'
        END;
    END IF;
END$$

CREATE TRIGGER set_flight_status_on_update
BEFORE UPDATE ON flights
FOR EACH ROW
BEGIN
    IF NEW.status != 'canceled' THEN
        SET NEW.status = CASE
            WHEN NEW.date < CURDATE()                                                          THEN 'completed'
            WHEN NEW.date = CURDATE() AND CURTIME() > NEW.arrival                             THEN 'completed'
            WHEN NEW.date = CURDATE() AND CURTIME() BETWEEN NEW.departure AND NEW.arrival     THEN 'in air'
            ELSE 'scheduled'
        END;
    END IF;
END$$

DELIMITER ;


-- 11. Fix alternative() procedure: update status filter from 'air' to 'in air'

DROP PROCEDURE IF EXISTS alternative;

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
      AND  status         != 'in air'
    ORDER BY price ASC;
END$$

DELIMITER ;


-- 12. Backfill existing flight statuses

UPDATE flights
SET status = CASE
    WHEN date < CURDATE()                                                     THEN 'completed'
    WHEN date = CURDATE() AND CURTIME() > arrival                             THEN 'completed'
    WHEN date = CURDATE() AND CURTIME() BETWEEN departure AND arrival         THEN 'in air'
    ELSE 'scheduled'
END
WHERE status != 'canceled';
