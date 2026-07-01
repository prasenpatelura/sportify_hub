# Sportify Hub: API Architecture

The backend will be built with Node.js, Express, and MongoDB.

## Base URL
`https://api.sportifyhub.com/v1`

## Authentication (`/auth`)
* `POST /auth/register` - Register a new user (Email/Password or OAuth).
* `POST /auth/login` - Authenticate a user and return JWT.
* `POST /auth/verify-otp` - Phone OTP verification.
* `POST /auth/refresh` - Refresh access tokens.

## Users (`/users`)
* `GET /users/me` - Get current user profile.
* `PUT /users/me` - Update profile (avatar, favorite sports, skill level).
* `GET /users/:id` - Get public profile of another user.
* `GET /users/nearby` - Find players nearby based on geolocation.

## Venues (`/venues`)
* `GET /venues` - List venues with filters (distance, sport type, ratings).
* `GET /venues/:id` - Get specific venue details.
* `GET /venues/:id/slots` - Get real-time slot availability for a specific date.

## Bookings (`/bookings`)
* `POST /bookings` - Create a new booking (locks slot temporarily).
* `GET /bookings` - Get user's booking history and upcoming bookings.
* `GET /bookings/:id` - Get specific booking details.
* `POST /bookings/:id/payment` - Process payment for a booking (Stripe/Razorpay webhook).
* `POST /bookings/:id/cancel` - Cancel a booking.

## Matches & Community (`/games`)
* `POST /games` - Create a public/private match.
* `GET /games` - List public games nearby.
* `GET /games/:id` - Get match details.
* `POST /games/:id/rsvp` - Join/RSVP to a match.
* `POST /games/:id/messages` - Post a message in the match group chat.

## Trainers (`/trainers`)
* `GET /trainers` - List available coaches/trainers.
* `GET /trainers/:id` - Get trainer profile and reviews.
* `POST /trainers/:id/book` - Book a training session.

## Activity & Gamification (`/activity`)
* `GET /activity/leaderboard` - Get global/local leaderboards.
* `GET /activity/stats` - Get user's personal stats (games played, hours).
