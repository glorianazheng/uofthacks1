# STAKE Backend - Complete Implementation Guide

Complete reference for all backend features, models, and API endpoints.

---

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start the Server
```bash
npm run dev
```

Server runs on: `http://localhost:3001`

### 3. Database
- **Type**: SQLite
- **File**: `./data/betting_app.db`
- **Auto-sync**: Yes (on server start)

---

## Architecture Overview

### Technology Stack
- **Framework**: Express.js
- **ORM**: Sequelize
- **Database**: SQLite
- **Authentication**: bcrypt (password hashing)
- **IDs**: UUID v4

### Key Design Patterns
- Middleware for automatic deadline locking
- Weighted random selection for loser assignment
- Friend following system (one-way → mutual)
- Feed aggregation (circles + followed users)

---

## Database Models

### 1. User
Profile with authentication and stats.

```
- id (UUID, PK)
- username (string, UNIQUE) - For login
- password (string, hashed) - bcrypt
- name (string) - Display name
- emoji (string) - Avatar
- wins (int) - Total wins
- losses (int) - Total losses
- streak (int) - Win/loss streak
- createdAt, updatedAt
```

### 2. Group (Circle)
Friend group for creating bets together.

```
- id (UUID, PK)
- name (string) - Circle name
- inviteCode (string, UNIQUE) - 6-char code for joining
- description (string, optional)
- createdBy (UUID, FK → User)
- createdAt, updatedAt
```

### 3. GroupMember
Many-to-many join table for Group membership.

```
- id (UUID, PK)
- userId (UUID, FK)
- groupId (UUID, FK)
- joinedAt (timestamp)
```

### 4. Friendship
Social connection between users.

```
- id (UUID, PK)
- userId (UUID, FK) - The follower
- friendId (UUID, FK) - The followed user
- status (enum: 'following' | 'mutual')
- createdAt
```

### 5. Bet
The core bet with outcomes and stake.

```
- id (UUID, PK)
- groupId (UUID, FK)
- title (string)
- description (string, optional)
- category (enum: 'sports' | 'entertainment' | 'weather' | 'custom')
- status (enum: 'open' | 'locked' | 'resolved' | 'completed')
- createdBy (UUID, FK → User)
- deadline (datetime) - When betting closes
- stake (string) - The consequence/wager
- winningOutcomeId (UUID, FK, optional)
- resolvedAt (datetime, optional)
- resolvedBy (UUID, FK, optional)
- createdAt, updatedAt
```

### 6. Outcome
Possible results for a bet.

```
- id (UUID, PK)
- betId (UUID, FK)
- label (string) - Option text
- weight (int) - For weighted random selection
- createdAt, updatedAt
```

### 7. Entry
User's participation in a bet.

```
- id (UUID, PK)
- betId (UUID, FK)
- userId (UUID, FK)
- outcomeId (UUID, FK)
- confidence (int) - 10-100 (from 1-10 slider)
- result (enum: 'pending' | 'win' | 'loss')
- completedAt (datetime, optional)
- proofUrl (string, optional)
- createdAt, updatedAt
```

---

## Authentication

### Sign Up
**POST** `/api/auth/signup`

Create new account with unique username.

**Request:**
```json
{
  "username": "gloria_z",
  "password": "SecurePass123",
  "name": "Gloria",
  "emoji": "📚"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "username": "gloria_z",
  "name": "Gloria",
  "emoji": "📚",
  "wins": 0,
  "losses": 0,
  "streak": 0
}
```

**Validation:**
- Username: min 3 chars, unique
- Password: min 6 chars, bcrypt hashed
- Password never returned in responses

**Error Responses:**
- `400` - Missing fields or invalid format
- `409` - Username already taken

---

### Login
**POST** `/api/auth/login`

Authenticate with username/password.

**Request:**
```json
{
  "username": "gloria_z",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "username": "gloria_z",
  "name": "Gloria",
  "emoji": "📚",
  "wins": 5,
  "losses": 2,
  "streak": 2
}
```

**Error Responses:**
- `400` - Missing fields
- `401` - Invalid credentials

---

## Circles (Groups)

### Create Circle
**POST** `/api/circles`

Create a new circle and get a 6-char invite code.

**Request:**
```json
{
  "name": "UofT Hacks Squad",
  "creatorName": "Alex",
  "creatorEmoji": "🚀"
}
```

**Response (201):**
```json
{
  "message": "Group \"UofT Hacks Squad\" created! Share invite code: AB3K9F",
  "group": {
    "id": "uuid",
    "name": "UofT Hacks Squad",
    "inviteCode": "AB3K9F",
    "createdBy": "creator-uuid"
  }
}
```

**Invite Code:**
- 6-character alphanumeric
- Randomly generated
- Unique per circle
- Case-insensitive for joining

---

### Join Circle
**POST** `/api/groups/join`

Join existing circle with invite code.

**Request:**
```json
{
  "name": "Jordan",
  "emoji": "⚡",
  "inviteCode": "AB3K9F"
}
```

**Response (201):**
```json
{
  "message": "Welcome Jordan! Successfully joined group: UofT Hacks Squad",
  "user": {
    "id": "new-uuid",
    "name": "Jordan",
    "emoji": "⚡"
  },
  "group": {
    "id": "group-uuid",
    "name": "UofT Hacks Squad"
  }
}
```

**Error Responses:**
- `400` - Missing fields
- `404` - Invalid invite code

---

### Get Circle Details
**GET** `/api/groups/:groupId`

Get circle with all members.

**Response (200):**
```json
{
  "id": "group-uuid",
  "name": "UofT Hacks Squad",
  "inviteCode": "AB3K9F",
  "members": [
    { "id": "uuid", "name": "Alex", "emoji": "🚀" },
    { "id": "uuid", "name": "Jordan", "emoji": "⚡" }
  ]
}
```

---

## Bets

### Create Bet
**POST** `/api/bets`

Create bet with multiple outcomes, stake, and deadline.

**Request:**
```json
{
  "groupId": "group-uuid",
  "title": "Will the Raptors beat the Lakers?",
  "category": "sports",
  "createdBy": "creator-uuid",
  "deadline": "2026-01-20T23:59:59Z",
  "stake": "Buy the loser bubble tea 🧋",
  "outcomes": [
    { "label": "Raptors Win", "weight": 5 },
    { "label": "Lakers Win", "weight": 5 }
  ]
}
```

**Response (201):**
```json
{
  "message": "Bet \"Will the Raptors beat the Lakers?\" created with 2 options.",
  "bet": {
    "id": "bet-uuid",
    "title": "Will the Raptors beat the Lakers?",
    "status": "open",
    "deadline": "2026-01-20T23:59:59Z",
    "outcomes": [
      { "id": "uuid", "label": "Raptors Win", "weight": 5 },
      { "id": "uuid", "label": "Lakers Win", "weight": 5 }
    ]
  }
}
```

**Validation:**
- Min 2 outcomes required
- Deadline must be in future
- Weight defaults to 1 if not provided

**Bet Lifecycle:**
1. **open** - Created, accepting entries
2. **locked** - Deadline passed, no more entries
3. **resolved** - Winner determined, losers assigned
4. **completed** - All consequences fulfilled

---

### Join Bet
**POST** `/api/bets/:betId/join`

Pick an outcome and set confidence level.

**Request:**
```json
{
  "userId": "user-uuid",
  "outcomeId": "outcome-uuid",
  "confidence": 8
}
```

**Response (201):**
```json
{
  "message": "Alex 🚀 joined the bet \"Will Raptors win?\" - picking \"Raptors Win\" with 8/10 confidence!",
  "entry": {
    "id": "entry-uuid",
    "betId": "bet-uuid",
    "userId": "user-uuid",
    "outcomeId": "outcome-uuid",
    "confidence": 80,
    "result": "pending"
  },
  "confidenceSlider": 8,
  "confidencePercentage": 80
}
```

**Auto-Locking Logic:**
- Middleware `checkAndLockBetIfExpired` runs automatically
- If current time > deadline, bet status changes to 'locked'
- Prevents joining locked bets

**Validation:**
- Confidence: 1-10 (converted to 10-100% internally)
- User can only join once per bet
- Outcome must exist and belong to this bet

**Error Responses:**
- `400` - Confidence out of range or bet locked
- `404` - User, bet, or outcome not found
- `400` - User already joined this bet

---

### Resolve Bet
**PUT** `/api/bets/:betId/resolve`

Set winning outcome and determine losers.

**Request:**
```json
{
  "winningOutcomeId": "outcome-uuid",
  "resolvedBy": "resolver-user-uuid"
}
```

**Response (200):**
```json
{
  "message": "Bet resolved! Winners: 3, Losers: 2",
  "bet": {
    "id": "bet-uuid",
    "status": "resolved",
    "winningOutcomeId": "outcome-uuid",
    "resolvedAt": "2026-01-20T23:59:59Z"
  },
  "losers": [
    {
      "userId": "uuid",
      "name": "Jordan",
      "emoji": "⚡",
      "selectedOutcome": "Lakers Win"
    }
  ]
}
```

**Loser Selection:**
- Uses weighted random selection based on confidence
- Higher confidence = higher chance of being selected as loser
- If multiple outcomes picked, losers from non-winning outcomes

---

### Get Bet
**GET** `/api/bets/:betId`

Get bet details with all entries.

**Response (200):**
```json
{
  "id": "bet-uuid",
  "title": "Will the Raptors beat the Lakers?",
  "status": "open",
  "deadline": "2026-01-20T23:59:59Z",
  "stake": "Buy the loser bubble tea 🧋",
  "outcomes": [
    {
      "id": "outcome-uuid",
      "label": "Raptors Win",
      "entries": [
        {
          "id": "entry-uuid",
          "user": { "name": "Alex", "emoji": "🚀" },
          "confidence": 80,
          "result": "pending"
        }
      ]
    }
  ]
}
```

---

## Feed

### Get Personalized Feed
**GET** `/api/feed/:userId`

Fetch all active bets from circles + followed users.

**Response (200):**
```json
{
  "userId": "user-uuid",
  "betCount": 5,
  "circleCount": 2,
  "followingCount": 3,
  "bets": [
    {
      "id": "bet-uuid",
      "title": "Will the Raptors beat the Lakers?",
      "status": "open",
      "deadline": "2026-01-19T23:59:59Z",
      "stake": "Buy the loser bubble tea 🧋",
      "creator": {
        "name": "Alex",
        "emoji": "🚀",
        "wins": 5,
        "losses": 2
      },
      "group": {
        "name": "UofT Hacks Squad",
        "inviteCode": "AB3K9F"
      },
      "outcomes": [
        { "label": "Raptors Win" },
        { "label": "Lakers Win" }
      ]
    }
  ]
}
```

**Algorithm:**
1. Get all circles user is in
2. Get all users they follow
3. Fetch open bets from those circles/users
4. Remove duplicates
5. Sort by deadline (soonest first)

---

## Friends & Social

### Add Friend (Follow)
**POST** `/api/friends/add`

Start following a user.

**Request:**
```json
{
  "userId": "follower-uuid",
  "friendId": "followed-uuid"
}
```

**Response (201):**
```json
{
  "id": "friendship-uuid",
  "userId": "follower-uuid",
  "friendId": "followed-uuid",
  "status": "following"
}
```

**Error Responses:**
- `400` - Cannot follow yourself
- `409` - Already following

---

### Accept Friend (Mutual)
**POST** `/api/friends/accept`

Convert follow → mutual friendship.

**Request:**
```json
{
  "userId": "user-uuid",
  "friendId": "friend-uuid"
}
```

**Response (200):**
```json
{
  "id": "friendship-uuid",
  "status": "mutual"
}
```

**Logic:**
- When friend accepts follow request
- Both relationships become mutual
- Creates reverse relationship if needed

---

### Get Friends List
**GET** `/api/friends/list/:userId`

Get all social connections.

**Response (200):**
```json
{
  "userId": "user-uuid",
  "following": [
    {
      "id": "friendship-uuid",
      "user": { "name": "Alex", "emoji": "🚀" },
      "status": "following"
    }
  ],
  "followers": [
    {
      "id": "friendship-uuid",
      "user": { "name": "Jordan", "emoji": "⚡" },
      "status": "following"
    }
  ],
  "mutual": [
    {
      "id": "friendship-uuid",
      "user": { "name": "Sam", "emoji": "🎮" },
      "status": "mutual"
    }
  ],
  "mutualCount": 1,
  "followingCount": 1,
  "followersCount": 1
}
```

---

## Complete Example User Journey

### 1. Sign Up
```bash
POST /api/auth/signup
{
  "username": "gloria_z",
  "password": "Pass123!",
  "name": "Gloria",
  "emoji": "📚"
}
# Returns: User object with ID
```

### 2. Create a Circle
```bash
POST /api/circles
{
  "name": "Study Group",
  "creatorName": "Gloria",
  "creatorEmoji": "📚"
}
# Returns: Invite code "K9F3X2"
```

### 3. Invite Friends (Share "K9F3X2")
Friends join via:
```bash
POST /api/groups/join
{
  "name": "Sam",
  "emoji": "🎮",
  "inviteCode": "K9F3X2"
}
```

### 4. Create a Bet in the Circle
```bash
POST /api/bets
{
  "groupId": "circle-uuid",
  "title": "Who finishes first?",
  "category": "custom",
  "createdBy": "gloria-uuid",
  "deadline": "2026-01-19T17:00:00Z",
  "stake": "Buy coffee for winner ☕",
  "outcomes": [
    { "label": "Gloria", "weight": 5 },
    { "label": "Sam", "weight": 5 }
  ]
}
# Returns: Bet with outcomes
```

### 5. Friends Join the Bet
```bash
POST /api/bets/bet-uuid/join
{
  "userId": "sam-uuid",
  "outcomeId": "sam-outcome-uuid",
  "confidence": 7
}
# Returns: Entry confirmation
```

### 6. Check Your Feed
```bash
GET /api/feed/gloria-uuid
# Returns: All active bets from circles + followed users
```

### 7. Resolve the Bet
```bash
PUT /api/bets/bet-uuid/resolve
{
  "winningOutcomeId": "gloria-outcome-uuid",
  "resolvedBy": "gloria-uuid"
}
# Returns: Losers assigned via weighted random selection
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message describing what went wrong",
  "status": 400
}
```

### Common HTTP Status Codes
- `200` - OK (GET, PUT successful)
- `201` - Created (POST successful)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (login failed)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate entry)
- `500` - Server Error

---

## Testing Checklist

### Authentication
- [ ] Sign up with valid credentials
- [ ] Cannot sign up with duplicate username
- [ ] Login with correct password
- [ ] Login fails with wrong password

### Circles
- [ ] Create circle gets 6-char code
- [ ] Join circle with valid code
- [ ] Join circle fails with invalid code
- [ ] View circle members

### Bets
- [ ] Create bet with 2+ outcomes
- [ ] Join bet before deadline
- [ ] Cannot join after deadline (auto-locked)
- [ ] Cannot join if already joined
- [ ] Confidence range 1-10

### Feed
- [ ] User in 1 circle sees that circle's bets
- [ ] User following someone sees their bets
- [ ] Feed excludes locked/resolved bets
- [ ] Feed sorted by deadline

### Friends
- [ ] User can follow another user
- [ ] Follower can accept to become mutual
- [ ] Friends list shows all categories

---

## Performance Notes

### Indexes (Recommended)
```sql
CREATE INDEX idx_user_username ON users(username);
CREATE INDEX idx_group_invite_code ON groups(inviteCode);
CREATE INDEX idx_bet_group_status ON bets(groupId, status);
CREATE INDEX idx_entry_user_bet ON entries(userId, betId);
CREATE INDEX idx_friendship_user ON friendships(userId, friendId);
```

### N+1 Query Prevention
- All routes use eager loading (include)
- User passwords excluded from queries
- Limit entries per bet in response

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] CORS configured for frontend URL
- [ ] Rate limiting added
- [ ] Request logging enabled
- [ ] Error monitoring set up
- [ ] HTTPS enabled in production
- [ ] Password requirements enforced
- [ ] Invite codes validated
- [ ] Deadline timezone handling verified
