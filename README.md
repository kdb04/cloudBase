# cloudBase

A full-stack airport management system for flight bookings, user authentication, loyalty tracking, and admin operations.

## Tech Stack

- **Frontend** — React + Tailwind CSS
- **Backend** — Node.js + Express.js
- **Database** — MySQL
- **Auth** — JWT + bcrypt
- **Payments** — Stripe

## Features

### User-Facing
- **Authentication** — Register, login, forgot password, JWT-based sessions
- **Flight Search & Booking** — Search flights by route/date, interactive seat map, dynamic pricing based on availability
- **Payments** — Stripe-powered checkout with a payment modal
- **Booking Management** — View and cancel bookings, see alternative flights for cancelled routes, email confirmations sent on booking and cancellation
- **Loyalty Program** — Points tracking and status tiers
- **Flight Status** — Live flight status page
- **User Profile** — View and manage account details
- **Contact Form** — Email-based contact with backend handling

### Admin Panel
- Flight schedule management
- Runway conflict prevention (no two flights on same runway within 30 min)
- Route monitoring
- Dynamic pricing controls
- Blacklist management for suspicious emails

### Real-time Information
- Weather widget (OpenWeather API)
- Security alerts and travel guidelines

## Database Design

Key tables: `flights`, `ticket`, `users`, `commuters`, `airlines`, `airport`, `blacklisted_emails`

Notable triggers:
- `decrease_seats` — auto-decrement available seats on booking
- `prevent_overbooking` — block bookings when no seats remain
- `prevent_runway_conflict` — prevent flights on the same runway within 30 minutes

Stored procedures:
- `alternative(flight_id, date)` — find alternative flights for cancelled bookings
- `dynamic_pricing(flight_id)` — adjust prices based on seat availability

## TODO

- [ ] Deployment
