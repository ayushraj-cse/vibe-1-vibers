# Lawazia Mobility Desk

One Toto. College · Station · Office.

An internal mobility desk: students and employees request a ride, the rider
accepts it (holding the one Toto for that time), checks everyone onto the
vehicle at pickup, drops the trip when done, and both sides can look back at
trip history.

## Stack

Next.js (App Router) + MongoDB Atlas. No auth SDK — login is a small
username/password system with an HMAC-signed session cookie.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `MONGODB_URI` — your MongoDB Atlas connection string (a database user
     with read/write access; make sure your current IP is allow-listed in
     Atlas Network Access).
   - `MONGODB_DB` — defaults to `mobility_desk`, change if you want.
   - `SESSION_SECRET` — any random string.
3. `npm run dev`
4. Open http://localhost:3000

No seed data is needed — sign up accounts directly from the app.

## How the app is organized

```
app/
  login/            login + signup
  dashboard/         role-based desk (request form, rider controls, history)
  api/auth/          signup, login, logout, me
  api/trips/         create + list trips, plus [id]/accept, /board, /done
components/          RequestForm, TripCard, StatusBadge
lib/                 mongodb.js (db connection), session.js (auth cookie)
models/              user.js, trip.js (thin db helpers + shared constants)
```

One `trips` collection holds everything: requester info, from/to, when,
the passenger list (each with a boarded/missed/pending status), and the
trip's own status (`requested` → `accepted` → `done`, or `clashed`).

## Core rule: one Toto

Only one trip can be in `accepted` status at any moment. If the rider tries
to accept a second request while one is already held, that second request
is marked `clashed` and the rider sees exactly why.

## Demo flow (for the evaluator)

1. **Sign up three accounts**: a student (or employee), a second
   student/employee, and a rider. Use the role picker on sign up.
2. As the student, submit **two requests for the same date/time** (e.g. both
   College → Station, same timestamp), each with a couple of passenger
   names.
3. Log in as the **rider**. Under "Pending requests," Accept the first one —
   it moves to "Active trip." Try to Accept the second — it's rejected and
   flips to **Clash**, with the reason shown.
4. On the active trip, mark passengers **Boarded** / **Missed** individually
   (test: 3 names → 2 boarded, 1 missed), then hit **Drop · Mark done**. The
   Toto becomes free again (visible in "Active trip" going empty).
5. Log back in as the passengers who were named on that trip — their
   **personal history** shows the trip with their own boarding status.
6. Log back in as the rider — **rider history** shows every trip, including
   the clashed one and the completed one.

## Known limitations

- This sandbox environment has no npm registry access, so the app was
  hand-written and syntax-checked but not run end-to-end against a live
  MongoDB Atlas instance here — test the flow once on your machine before
  the demo.
- "Same time" conflict detection is simplified to "only one trip may be
  `accepted` at a time" (matches "the rider can run only one trip at a
  time" in the brief), rather than comparing time ranges — simplest
  interpretation that satisfies the required clash check.
- Person history matches passengers by name (case-insensitive) against the
  logged-in user's own name, so a passenger's typed name should match their
  account name to show up in their history.
- No live tracking, fare, map, or second vehicle — explicitly out of scope.
