# cloudBase

A full-stack web application for managing airport operations, flight bookings, and administrative tasks.

## Overview

This project is a comprehensive airport management system built with:
- Frontend: React 
- Backend: Node + Express.js
- Database: MySQL

## Features

- User Authentication
  - Login/Registration system
  - Password encryption
  - Blacklist system for suspicious emails

- Flight Booking
  - Search available flights
  - Book tickets with seat selection
  - Cancel bookings
  - View alternative flights for cancelled bookings
  - Dynamic pricing based on seat availability

- Admin Panel
  - Flight schedule management
  - Runway conflict prevention
  - Route monitoring
  - Dynamic pricing controls

- Real-time Information
  - Weather updates
  - Security alerts
  - Travel guidelines
  - Health protocols

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=ams
   PORT=3000
   ```

4. Set up the database:
   ```bash
   mysql -u root -p < database/project.sql
   mysql -u root -p < database/triggers.sql
   mysql -u root -p < database/functions.sql
   mysql -u root -p < database/views.sql
   ```

5. Start the applications:
   ```bash
   # Backend
   cd backend
   node src/app.js

   # Frontend
   cd frontend
   npm run dev
   ```

## Key Features Implementation

### Security
- Password hashing using bcrypt
- Email blacklist system
- Protected admin routes

### Database Features
- Triggers for seat management
- Stored procedures for alternative flight search
- Dynamic pricing algorithm
- Runway conflict prevention

### Frontend Features
- Responsive design
- Real-time form validation
- Interactive booking interface
- Admin dashboard

