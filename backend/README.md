# Bet → Consequence Backend

A Node.js + Express backend for the social betting app where friends bet with chores as stakes.

## Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **Sequelize** - ORM
- **SQLite** - Database (local development)
- **UUID** - Unique identifiers

## Project Structure

```
backend/
├── server.js          # Express app setup and routes
├── database.js        # Sequelize models and database config
├── package.json       # Dependencies
├── .env.example       # Environment variables template
├── data/
│   └── betting_app.db # SQLite database (auto-created)
└── routes/            # API endpoints (to be created)
```

## Database Schema

### Users Table
- `id` (UUID, PK)
- `name` (string)
- `emoji` (string)
- `wins` (integer, default: 0)
- `losses` (integer, default: 0)
- `streak` (integer, default: 0)
- `createdAt`, `updatedAt` (timestamp)

### Groups Table
- `id` (UUID, PK)
- `name` (string)
- `inviteCode` (string, unique)
- `description` (string)
- `createdBy` (UUID, FK → User)
- `createdAt`, `updatedAt` (timestamp)

### GroupMembers Table
- `id` (UUID, PK)
- `userId` (UUID, FK → User)
- `groupId` (UUID, FK → Group)
- `joinedAt` (timestamp)

### Bets Table
- `id` (UUID, PK)
- `groupId` (UUID, FK → Group)
- `title` (string)
- `description` (text)
- `category` (enum: sports, entertainment, weather, custom)
- `status` (enum: open, locked, resolved, completed)
- `createdBy` (UUID, FK → User)
- `deadline` (timestamp)
- `stake` (string)
- `winningOutcomeId` (UUID)
- `resolvedAt` (timestamp)
- `resolvedBy` (UUID, FK → User)
- `createdAt`, `updatedAt` (timestamp)

### Outcomes Table
- `id` (UUID, PK)
- `betId` (UUID, FK → Bet)
- `label` (string)
- `weight` (integer, 1-10 for weighted odds)
- `createdAt` (timestamp)

### Entries Table (User's bet picks)
- `id` (UUID, PK)
- `betId` (UUID, FK → Bet)
- `userId` (UUID, FK → User)
- `outcomeId` (UUID, FK → Outcome)
- `confidence` (integer, 1-100)
- `result` (enum: pending, win, loss)
- `completedAt` (timestamp)
- `proofUrl` (string)
- `createdAt`, `updatedAt` (timestamp)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

### 3. Start Server

```bash
npm run dev    # Development with auto-reload
npm start      # Production
```

Server will run on `http://localhost:3001`

## API Endpoints (To Be Implemented)

### Users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group with members
- `POST /api/groups/:id/members` - Join group
- `GET /api/groups/:id/members` - List members

### Bets
- `POST /api/bets` - Create bet
- `GET /api/bets/:id` - Get bet details
- `GET /api/groups/:id/bets` - List group bets
- `POST /api/bets/:id/entries` - Join bet
- `PUT /api/bets/:id/resolve` - Resolve bet

### Entries
- `GET /api/entries/:id` - Get entry details
- `PUT /api/entries/:id` - Update entry (confidence, proof)
- `PUT /api/entries/:id/complete` - Mark consequence as complete

## Database Models

All models are defined in `database.js` with these features:

- Full relationships (hasMany, belongsTo)
- Timestamps (createdAt, updatedAt)
- Enum fields for status
- UUID primary keys
- Validation on confidence scores

## Available Scripts

```bash
npm start      # Start server (production)
npm run dev    # Start with auto-reload
npm run seed   # Seed database with test data (when created)
```

## Example Usage

```javascript
import { User, Group, Bet, Entry, initializeDatabase } from './database.js';

// Initialize database
await initializeDatabase();

// Create a user
const user = await User.create({
  name: 'Jay',
  emoji: '😎',
});

// Create a group
const group = await Group.create({
  name: 'House 511',
  inviteCode: 'ABC123',
  createdBy: user.id,
});

// Create a bet
const bet = await Bet.create({
  groupId: group.id,
  title: 'Raptors vs Lakers',
  category: 'sports',
  createdBy: user.id,
  deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
  stake: 'Buy lunch',
});

// Create outcomes
const outcome1 = await Outcome.create({
  betId: bet.id,
  label: 'Raptors win',
});

const outcome2 = await Outcome.create({
  betId: bet.id,
  label: 'Lakers win',
});

// User picks an outcome
const entry = await Entry.create({
  betId: bet.id,
  userId: user.id,
  outcomeId: outcome1.id,
  confidence: 75,
});

console.log('Entry created:', entry.toJSON());
```

## Next Steps

1. Implement authentication (JWT or sessions)
2. Create API endpoint handlers for each route
3. Add input validation and error handling
4. Implement bet resolution logic
5. Add real-time updates with WebSockets (optional)
6. Create seed script for test data
7. Add API documentation (Swagger/OpenAPI)

## File Locations

- Models: `database.js`
- Server setup: `server.js`
- Routes: `routes/` (to be created)
- Controllers: `controllers/` (to be created)

---

**Ready to add API endpoints! See `BACKEND_INTEGRATION.md` in the frontend folder for how the frontend will connect to these endpoints.**
