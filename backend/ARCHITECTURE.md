# Backend Architecture Guide

## Project Structure

```
backend/
├── server.js              # Express app initialization
├── database.js            # Sequelize models & database config
├── package.json           # Dependencies
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── API.md                 # API documentation
├── data/
│   └── betting_app.db     # SQLite database (auto-created)
├── routes/
│   └── api.js             # REST API endpoints
└── scripts/
    └── seed.js            # Test data seeder
```

## Technology Stack

- **Runtime**: Node.js (v14+)
- **Framework**: Express.js 4.18.2
- **ORM**: Sequelize 6.35.2
- **Database**: SQLite3 5.1.6
- **UUID**: uuid 9.0.1
- **Middleware**: cors, body-parser, dotenv

## Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set Up Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Optionally edit `.env`:
```
PORT=3001
NODE_ENV=development
```

### 3. Seed the Database
```bash
node scripts/seed.js
```

This creates:
- 4 test users (Jay, Eva, Alex, Sam)
- 2 test groups (The Squad, Entertainment Crew)
- 3 sample bets (Sports, Entertainment, Weather)
- 6 outcomes and 7 entries for testing

### 4. Start the Server
```bash
node server.js
```

Server will run at `http://localhost:3001`

---

## Database Models

### User
Represents a player in the betting app.

```javascript
{
  id: UUID,
  name: String,          // Display name
  emoji: String,         // Avatar emoji
  wins: Integer,         // Total bets won
  losses: Integer,       // Total bets lost
  streak: Integer,       // Current winning streak
  createdAt: DateTime,
  updatedAt: DateTime
}
```

**Relationships:**
- Has many groups (created by user)
- Has many bets (created by user)
- Has many entries (bets user joined)
- Belongs to many groups (via GroupMember)

---

### Group
A collection of players making bets together.

```javascript
{
  id: UUID,
  name: String,
  createdBy: UUID,       // User who created group
  inviteCode: String,    // 6-char code (e.g., "SQUAD1")
  description: String,   // Optional
  createdAt: DateTime,
  updatedAt: DateTime
}
```

**Relationships:**
- Belongs to user (creator)
- Has many bets
- Has many members (via GroupMember)

---

### GroupMember (Junction)
Tracks membership in groups.

```javascript
{
  userId: UUID,          // Foreign key
  groupId: UUID,         // Foreign key
  createdAt: DateTime,
  updatedAt: DateTime
}
```

**Relationships:**
- Belongs to user
- Belongs to group

---

### Bet
A single prediction/bet in a group.

```javascript
{
  id: UUID,
  groupId: UUID,         // Which group
  title: String,         // "Will Raptors beat Celtics?"
  category: Enum,        // sports|entertainment|weather|custom
  status: Enum,          // open|locked|resolved|completed
  createdBy: UUID,       // User who created
  deadline: DateTime,    // When bets close
  stake: String,         // Consequence: "Buy coffee ☕"
  winningOutcomeId: UUID,// When resolved (optional)
  resolvedAt: DateTime,  // When resolved (optional)
  resolvedBy: UUID,      // Who resolved it (optional)
  createdAt: DateTime,
  updatedAt: DateTime
}
```

**Relationships:**
- Belongs to group
- Belongs to user (creator)
- Has many outcomes
- Has many entries

---

### Outcome
A possible result for a bet.

```javascript
{
  id: UUID,
  betId: UUID,
  label: String,         // "Raptors Win", "Celtics Win"
  weight: Integer,       // Odds weighting (1-10)
  createdAt: DateTime
}
```

**Relationships:**
- Belongs to bet
- Has many entries (users who chose this)

---

### Entry
A user's participation in a bet.

```javascript
{
  id: UUID,
  betId: UUID,
  userId: UUID,
  outcomeId: UUID,       // User's prediction
  confidence: Integer,   // 1-100% confidence
  result: Enum,          // pending|win|loss
  completedAt: DateTime, // When consequence was done
  proofUrl: String,      // Link to proof (optional)
  createdAt: DateTime,
  updatedAt: DateTime
}
```

**Relationships:**
- Belongs to bet
- Belongs to user
- Belongs to outcome

---

## API Routes

### Users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user stats

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group with members
- `POST /api/groups/join` - Join group with code
- `GET /api/groups/:groupId/bets` - Get group's bets

### Bets
- `POST /api/bets` - Create bet
- `GET /api/bets/:id` - Get bet with outcomes
- `PUT /api/bets/:id` - Update bet status/winner

### Entries
- `POST /api/entries` - User joins bet
- `GET /api/entries/:userId` - User's entries
- `PUT /api/entries/:id` - Update entry
- `PUT /api/entries/:id/complete` - Mark as win/loss

---

## Data Flow Examples

### Example 1: Create Group and Invite Friends

```
1. User A creates group
   POST /api/groups
   → Returns inviteCode: "SQUAD1"

2. User A shares code "SQUAD1" with friends

3. User B joins group
   POST /api/groups/join
   → { inviteCode: "SQUAD1", userId: "user-b" }

4. Get group members
   GET /api/groups/group-1
   → Returns all members
```

### Example 2: Create and Join Bet

```
1. User A creates bet
   POST /api/bets
   → { groupId, title, outcomes: [{label, weight}] }

2. Users B, C, D join bet
   POST /api/entries (3 times)
   → { betId, userId, outcomeId, confidence }

3. View bet with all picks
   GET /api/bets/bet-1
   → Returns outcomes with all entries

4. Resolve bet
   PUT /api/bets/bet-1
   → { status: "resolved", winningOutcomeId }

5. Mark consequences
   PUT /api/entries/entry-1/complete
   → { result: "win" }
   → Updates user.wins and user.streak
```

---

## Database Relationships

```
User
├── creates many Groups
├── creates many Bets
├── creates many Entries
└── belongs to many Groups
    (through GroupMember)

Group
├── belongs to User (creator)
├── has many GroupMembers
├── has many Users (through GroupMember)
└── has many Bets

Bet
├── belongs to Group
├── belongs to User (creator)
├── has many Outcomes
└── has many Entries

Outcome
├── belongs to Bet
└── has many Entries

Entry
├── belongs to Bet
├── belongs to User
└── belongs to Outcome
```

---

## Middleware Stack

1. **CORS** - Cross-origin requests enabled
2. **Body Parser (JSON)** - Parse JSON request bodies
3. **Body Parser (URL)** - Parse URL-encoded bodies
4. **Request Logging** - Log all requests with timestamp
5. **Routes** - API endpoint handlers
6. **Error Handler** - Catch and format errors
7. **404 Handler** - Handle unmatched routes

---

## Error Handling

All endpoints include try-catch blocks:

```javascript
router.post('/endpoint', async (req, res, next) => {
  try {
    // Request validation
    if (!required_field) {
      return res.status(400).json({ error: 'message' });
    }
    
    // Database operations
    const result = await Model.create(...);
    
    // Response
    res.status(201).json(result);
  } catch (error) {
    next(error);  // Pass to error handler
  }
});
```

Error responses:
```json
{
  "error": "Error message",
  "status": 400
}
```

---

## Testing Checklist

- [ ] POST /api/users (create user)
- [ ] GET /api/users/:id (fetch user)
- [ ] PUT /api/users/:id (update user)
- [ ] POST /api/groups (create group)
- [ ] GET /api/groups/:id (get group with members)
- [ ] POST /api/groups/join (join with code)
- [ ] GET /api/groups/:groupId/bets (list group bets)
- [ ] POST /api/bets (create bet with outcomes)
- [ ] GET /api/bets/:id (get bet with entries)
- [ ] PUT /api/bets/:id (resolve bet)
- [ ] POST /api/entries (user joins bet)
- [ ] GET /api/entries/:userId (user's entries)
- [ ] PUT /api/entries/:id (update entry)
- [ ] PUT /api/entries/:id/complete (mark win/loss)

---

## Common Issues & Solutions

### Issue: "Cannot find module 'package'"
**Solution:** Run `npm install` in the backend folder

### Issue: "Database is locked"
**Solution:** Delete `data/betting_app.db` and restart

### Issue: "Port 3001 already in use"
**Solution:** Change PORT in .env or kill process on port 3001

### Issue: "Association undefined"
**Solution:** Ensure models are properly associated before use

---

## Future Improvements

1. **Authentication**
   - JWT tokens
   - User sessions
   - Email verification

2. **Advanced Features**
   - Bet resolution with images/proofs
   - Consequence tracking system
   - Win/loss streaks leaderboard
   - Badge system

3. **Real-time**
   - WebSocket notifications
   - Live bet updates
   - Chat within groups

4. **Analytics**
   - User statistics
   - Win rate analytics
   - Bet history

5. **Admin Features**
   - Bet moderation
   - Dispute resolution
   - User management

---

## Environment Variables

```
# Server
PORT=3001
NODE_ENV=development

# Database
DB_PATH=./data/betting_app.db
```

---

## File Responsibilities

| File | Purpose |
|------|---------|
| `server.js` | Express app, middleware, error handling |
| `database.js` | Sequelize models, associations, initialization |
| `routes/api.js` | All endpoint definitions (CRUD operations) |
| `scripts/seed.js` | Generate test data |
| `package.json` | Dependencies, scripts |
| `.env.example` | Environment variable template |
| `.gitignore` | Files to exclude from git |

---

## Quick Commands

```bash
# Development
npm install          # Install dependencies
node server.js       # Start server
node scripts/seed.js # Populate database

# Testing
curl http://localhost:3001/api/health  # Test server
curl http://localhost:3001/api/users/user-1  # Get user

# Cleanup
rm data/betting_app.db  # Reset database
```

---

## Integration with Frontend

The frontend (React Router app at `http://localhost:5173`) will:
1. Call API endpoints on `http://localhost:3001/api/*`
2. Receive JSON responses with full data
3. Update user state based on API results
4. Display data from database models

Make sure CORS is enabled (✅ it is in `server.js`)
