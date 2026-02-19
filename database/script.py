#!/usr/bin/env python3
"""
Seed script for airport_db — inserts ~100 rows into every table.

Install deps first:
    pip install faker mysql-connector-python bcrypt
"""

import random
import bcrypt
from faker import Faker
import mysql.connector
from datetime import date, timedelta
from pathlib import Path

fake = Faker()

# Load .env 

def load_env(path):
    env = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return env

env = load_env(Path(__file__).parent / ".env")

# Connection 

conn = mysql.connector.connect(
    host=env["DB_HOST"],
    user=env["DB_USER"],
    password=env["DB_PASSWORD"],
    database=env["DB_NAME"],
    autocommit=False,
)
cur = conn.cursor()

# Pre-hash once — bcrypt is slow, no need to hash 100× for fake data
PW_HASH = bcrypt.hashpw(b"Seed1234!", bcrypt.gensalt(rounds=10)).decode()

# Reference data 

AIRPORT_ROWS = [
    ("JFK International",          "New York",    "New York",      "USA"),
    ("LAX International",          "Los Angeles", "California",    "USA"),
    ("OHare International",        "Chicago",     "Illinois",      "USA"),
    ("Heathrow",                   "London",      "England",       "UK"),
    ("Charles de Gaulle",          "Paris",       "Ile-de-France", "France"),
    ("Dubai International",        "Dubai",       "Dubai",         "UAE"),
    ("Changi",                     "Singapore",   "Singapore",     "Singapore"),
    ("Narita International",       "Tokyo",       "Kanto",         "Japan"),
    ("Frankfurt Airport",          "Frankfurt",   "Hesse",         "Germany"),
    ("Sydney Kingsford Smith",     "Sydney",      "NSW",           "Australia"),
    ("Toronto Pearson",            "Toronto",     "Ontario",       "Canada"),
    ("Mumbai Chhatrapati Shivaji", "Mumbai",      "Maharashtra",   "India"),
    ("Cape Town International",    "Cape Town",   "Western Cape",  "South Africa"),
    ("Sao Paulo Guarulhos",        "Sao Paulo",   "Sao Paulo",     "Brazil"),
    ("Mexico City Benito Juarez",  "Mexico City", "CDMX",          "Mexico"),
    ("Beijing Capital",            "Beijing",     "Beijing",       "China"),
    ("Incheon International",      "Seoul",       "Incheon",       "South Korea"),
    ("Amsterdam Schiphol",         "Amsterdam",   "North Holland", "Netherlands"),
    ("Istanbul Airport",           "Istanbul",    "Istanbul",      "Turkey"),
    ("Cairo International",        "Cairo",       "Cairo",         "Egypt"),
]
AIRPORTS = [r[0] for r in AIRPORT_ROWS]

AIRLINE_NAMES = [
    "Delta Airlines",        "American Airlines",  "United Airlines",
    "British Airways",       "Air France",         "Emirates",
    "Singapore Airlines",    "Japan Airlines",     "Lufthansa",
    "Qantas",                "Air Canada",         "IndiGo",
    "South African Airways", "LATAM Airlines",     "Aeromexico",
    "Air China",             "Korean Air",         "KLM",
    "Turkish Airlines",      "EgyptAir",
]

DOMAINS    = ["Security", "Operations", "Maintenance", "Customer Service", "Air Traffic Control"]
CLASSES    = ["Economy", "Business", "First"]
FOOD_PREFS = ["Veg", "Non-Veg", "Vegan", "None"]
STATUSES   = ["scheduled", "scheduled", "scheduled", "delayed", "canceled"]

try:
    # 1. users 
    print("Inserting users ...")
    user_ids = []
    for i in range(100):
        cur.execute(
            "INSERT INTO users (email, password, name, role) VALUES (%s,%s,%s,%s)",
            (f"seed{i}_{fake.user_name()}@{fake.domain_name()}", PW_HASH, fake.name(), "user"),
        )
        user_ids.append(cur.lastrowid)
    conn.commit()
    print(f"  ✓ {len(user_ids)} users")

    # 2. airport 
    print("Inserting airports ...")
    for row in AIRPORT_ROWS:
        cur.execute(
            "INSERT IGNORE INTO airport (airport_name, city, state, country) VALUES (%s,%s,%s,%s)",
            row,
        )
    conn.commit()
    print(f"  ✓ {len(AIRPORTS)} airports")

    # 3. airlines 
    print("Inserting airlines ...")
    airline_ids = []
    for i, (name, airport) in enumerate(zip(AIRLINE_NAMES, AIRPORTS), start=1):
        cur.execute(
            "INSERT IGNORE INTO airlines (airline_id, airline_name, airport_name) VALUES (%s,%s,%s)",
            (i, name, airport),
        )
        airline_ids.append(i)
    conn.commit()
    print(f"  ✓ {len(airline_ids)} airlines")

    # 4. bus
    print("Inserting bus ...")
    plate = 10_000_000
    for _ in range(50):
        plate += random.randint(10, 99)
        cur.execute(
            "INSERT INTO bus (airport_name, number_plate, status, destination, start_time) "
            "VALUES (%s,%s,%s,%s,%s)",
            (
                random.choice(AIRPORTS),
                plate,
                random.choice(["active", "inactive", "maintenance"]),
                fake.city(),
                fake.time(),
            ),
        )
    conn.commit()
    print("  ✓ 50 bus rows")

    # 5. commuters 
    print("Inserting commuters ...")
    commuter_nos = []
    used_passports: set = set()
    pno = 2_000_000_000
    for uid in user_ids:
        pno += random.randint(1, 9)
        passport = random.randint(100_000_000, 999_999_999)
        while passport in used_passports:
            passport += 1
        used_passports.add(passport)
        cur.execute(
            "INSERT INTO commuters "
            "(passenger_no, passport_no, fname, mname, lname, age, airport_name, user_id) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
            (pno, passport, fake.first_name(), fake.first_name(),
             fake.last_name(), random.randint(18, 75),
             random.choice(AIRPORTS), uid),
        )
        commuter_nos.append(pno)
    conn.commit()
    print(f"  ✓ {len(commuter_nos)} commuters")

    # 6. commuter_phone 
    print("Inserting commuter_phone ...")
    cnt = 0
    for pno in commuter_nos:
        for _ in range(random.randint(1, 2)):
            cur.execute(
                "INSERT INTO commuter_phone (passenger_no, phone_no) VALUES (%s,%s)",
                (pno, random.randint(1_000_000_000, 9_999_999_999)),
            )
            cnt += 1
    conn.commit()
    print(f"  ✓ {cnt} commuter_phone rows")

    # 7. flights 
    # Runway conflict rule: same runway + same date must be 30+ min apart.
    # Strategy: 20 runways, each flight on a runway gets departure = slot * 90 min.
    # Same-runway flights are always 90 min apart regardless of date. ✓
    print("Inserting flights ...")
    flight_ids = []
    fid = 1000
    base_dates = [date.today() + timedelta(days=d) for d in range(1, 16)]
    runway_slot = {r: 0 for r in range(1, 21)}
    for i in range(100):
        runway = (i % 20) + 1
        slot = runway_slot[runway]
        runway_slot[runway] += 1
        dep_min = (slot * 90) % (24 * 60)
        arr_min = (dep_min + random.randint(60, 300)) % (24 * 60)
        dep_h, dep_m = divmod(dep_min, 60)
        arr_h, arr_m = divmod(arr_min, 60)
        src, dst = random.sample(AIRPORTS, 2)
        fid += random.randint(1, 9)
        cur.execute(
            "INSERT INTO flights "
            "(flight_id, airline_id, status, source, destination, arrival, departure, "
            "available_seats, price, date, runway_no, stops) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
            (
                fid, random.choice(airline_ids),
                random.choice(STATUSES),
                src, dst,
                f"{arr_h:02d}:{arr_m:02d}:00",
                f"{dep_h:02d}:{dep_m:02d}:00",
                random.randint(100, 200),
                random.randint(5_000, 80_000),
                random.choice(base_dates),
                runway,
                random.choice([0, 0, 0, 1, 2]),
            ),
        )
        flight_ids.append(fid)
    conn.commit()
    print(f"  ✓ {len(flight_ids)} flights")

    # 8. staff 
    print("Inserting staff ...")
    staff_ids = []
    sid = 5000
    for _ in range(100):
        sid += random.randint(1, 9)
        cur.execute(
            "INSERT INTO staff (id, airport_name, salary, domain, age, gender, fname, mname, lname) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
            (
                sid, random.choice(AIRPORTS),
                random.randint(30_000, 120_000),
                random.choice(DOMAINS),
                random.randint(22, 60),
                random.choice(["M", "F"]),
                fake.first_name(), fake.first_name(), fake.last_name(),
            ),
        )
        staff_ids.append(sid)
    conn.commit()
    print(f"  ✓ {len(staff_ids)} staff")

    # 9. staff_phone
    print("Inserting staff_phone ...")
    for sid in staff_ids:
        cur.execute(
            "INSERT INTO staff_phone (id, phone) VALUES (%s,%s)",
            (sid, random.randint(1_000_000_000, 9_999_999_999)),
        )
    conn.commit()
    print(f"  ✓ {len(staff_ids)} staff_phone rows")

    # 10. stalls 
    print("Inserting stalls ...")
    stall_id = 200
    for _ in range(60):
        stall_id += 1
        cur.execute(
            "INSERT INTO stalls (airport_name, stall_id, name, owner_name) VALUES (%s,%s,%s,%s)",
            (random.choice(AIRPORTS), stall_id, fake.company()[:40], fake.name()),
        )
    conn.commit()
    print("  ✓ 60 stalls")

    # 11. ticket 
    # decrease_seats trigger fires on each insert — flights start with 100–200
    # seats so 100 tickets spread across 100 flights won't trigger overbooking.
    print("Inserting tickets ...")
    ticket_ids = []
    pairs = list(zip(commuter_nos, user_ids))
    random.shuffle(pairs)
    for pno, uid in pairs[:100]:
        src, dst = random.sample(AIRPORTS, 2)
        cur.execute(
            "INSERT INTO ticket "
            "(passenger_no, class, food_preference, source, destination, "
            "seat_no, flight_id, user_id, transaction_id, payment_status, amount_paid) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
            (
                pno,
                random.choice(CLASSES),
                random.choice(FOOD_PREFS),
                src, dst,
                random.randint(1, 180),
                random.choice(flight_ids),
                uid,
                fake.uuid4(),
                random.choice(["Paid", "Paid", "Paid", "Pending", "Failed"]),
                round(random.uniform(1_000, 80_000), 2),
            ),
        )
        ticket_ids.append(cur.lastrowid)
    conn.commit()
    print(f"  ✓ {len(ticket_ids)} tickets")

    # 12. loyalty_points 
    print("Inserting loyalty_points ...")
    for uid in user_ids:
        pts = random.randint(0, 15_000)
        tier = (
            "Platinum" if pts >= 10_000 else
            "Gold"     if pts >= 5_000  else
            "Silver"   if pts >= 1_000  else
            "Bronze"
        )
        cur.execute(
            "INSERT INTO loyalty_points (user_id, points, tier) VALUES (%s,%s,%s)",
            (uid, pts, tier),
        )
    conn.commit()
    print(f"  ✓ {len(user_ids)} loyalty_points rows")

    # 13. point_transactions 
    print("Inserting point_transactions ...")
    for _ in range(100):
        cur.execute(
            "INSERT INTO point_transactions (user_id, ticket_id, points_earned, points_redeemed) "
            "VALUES (%s,%s,%s,%s)",
            (
                random.choice(user_ids),
                random.choice(ticket_ids) if random.random() > 0.2 else None,
                random.randint(0, 500),
                random.randint(0, 200),
            ),
        )
    conn.commit()
    print("  ✓ 100 point_transactions rows")

    # 14. waitlist
    print("Inserting waitlist ...")
    for _ in range(50):
        cur.execute(
            "INSERT INTO waitlist (user_id, flight_id, class, status) VALUES (%s,%s,%s,%s)",
            (
                random.choice(user_ids),
                random.choice(flight_ids),
                random.choice(CLASSES),
                random.choice(["waiting", "confirmed", "cancelled"]),
            ),
        )
    conn.commit()
    print("  ✓ 50 waitlist rows")

    print("\n All tables seeded successfully.")

except mysql.connector.Error as e:
    conn.rollback()
    print(f"\n DB error: {e}")
    raise

finally:
    cur.close()
    conn.close()
