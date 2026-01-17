# Bet → Consequence API Documentation

**Backend Server**: `http://localhost:3001`

## Overview

This is a RESTful API for the Bet → Consequence social betting app. The server is built with Express.js and uses Sequelize ORM with SQLite for data persistence.

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
node server.js

# Or seed the database with test data
node scripts/seed.js
```

The server will start on `http://localhost:3001`

---

## API Endpoints

### Health Check

#### GET `/api/health`

Check if the server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Bet → Consequence API is running"
}
```

---

### Users

#### POST `/api/users`

Create a new user.

**Body:**
```json
{
  "name": "string (required)",
  "emoji": "string (required)"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Jay",
  "emoji": "🤴",
  "wins": 0,
  "losses": 0,
  "streak": 0,
  "createdAt": "2026-01-17T18:47:04.667Z",
  "updatedAt": "2026-01-17T18:47:04.667Z"
}
```

---

#### GET `/api/users/:id`

Get a user by ID.

**Response:** `200 OK`
```json
{
  "id": "user-1",
  "name": "Jay",
  "emoji": "🤴",
  "wins": 5,
  "losses": 2,
  "streak": 3,
  "createdAt": "2026-01-17T18:47:04.667Z",
  "updatedAt": "2026-01-17T18:47:04.667Z"
}
```

**Errors:**
- `404 Not Found` - User doesn't exist

---

#### PUT `/api/users/:id`

Update a user.

**Body:** (all optional)
```json
{
  "name": "string",
  "emoji": "string",
  "wins": "number",
  "losses": "number",
  "streak": "number"
}
```

**Response:** `200 OK`
```json
{
  "id": "user-1",
  "name": "Jay",
  "emoji": "🤴",
  "wins": 5,
  "losses": 2,
  "streak": 3,
  "createdAt": "2026-01-17T18:47:04.667Z",
  "updatedAt": "2026-01-17T18:47:04.667Z"
}
```

---

### Groups

#### POST `/api/groups`

Create a new group. Auto-generates a 6-character invite code.

**Body:**
```json
{
  "name": "string (required)",
  "createdBy": "uuid (required)"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "The Squad",
  "createdBy": "user-1",
  "inviteCode": "SQUAD1",
  "createdAt": "2026-01-17T18:47:04.681Z",
  "updatedAt": "2026-01-17T18:47:04.681Z"
}
```

---

#### GET `/api/groups/:id`

Get a group with its members.

**Response:** `200 OK`
```json
{
  "id": "group-1",
  "name": "The Squad",
  "inviteCode": "SQUAD1",
  "createdBy": "user-1",
  "createdAt": "2026-01-17T18:47:04.681Z",
  "updatedAt": "2026-01-17T18:47:04.681Z",
  "members": [
    {
      "id": "user-1",
      "name": "Jay",
      "emoji": "🤴",
      "wins": 5,
      "losses": 2,
      "streak": 3,
      "createdAt": "2026-01-17T18:47:04.667Z",
      "updatedAt": "2026-01-17T18:47:04.667Z"
    }
  ]
}
```

**Errors:**
- `404 Not Found` - Group doesn't exist

---

#### POST `/api/groups/join`

Join a group with an invite code.

**Body:**
```json
{
  "inviteCode": "string (required)",
  "userId": "uuid (required)"
}
```

**Response:** `201 Created`
```json
{
  "message": "Successfully joined group: The Squad",
  "group": {
    "id": "group-1",
    "name": "The Squad",
    "inviteCode": "SQUAD1",
    "createdBy": "user-1",
    "createdAt": "2026-01-17T18:47:04.681Z",
    "updatedAt": "2026-01-17T18:47:04.681Z"
  }
}
```

**Errors:**
- `400 Bad Request` - User already member of group
- `404 Not Found` - Invalid invite code

---

#### GET `/api/groups/:groupId/bets`

Get all bets in a group.

**Response:** `200 OK`
```json
[
  {
    "id": "bet-1",
    "groupId": "group-1",
    "title": "Will Raptors beat Celtics?",
    "category": "sports",
    "status": "open",
    "createdBy": "user-1",
    "deadline": "2026-01-18T18:47:04.688Z",
    "stake": "Buy coffee ☕",
    "winningOutcomeId": null,
    "resolvedAt": null,
    "createdAt": "2026-01-17T18:47:04.688Z",
    "updatedAt": "2026-01-17T18:47:04.688Z",
    "outcomes": [
      {
        "id": "outcome-1",
        "betId": "bet-1",
        "label": "Raptors Win",
        "weight": 6,
        "createdAt": "2026-01-17T18:47:04.691Z"
      }
    ]
  }
]
```

---

### Bets

#### POST `/api/bets`

Create a new bet with outcomes.

**Body:**
```json
{
  "groupId": "uuid (required)",
  "title": "string (required)",
  "category": "enum: sports|entertainment|weather|custom",
  "createdBy": "uuid (required)",
  "deadline": "ISO8601 date (required)",
  "stake": "string (required)",
  "outcomes": [
    {
      "label": "string (required)",
      "weight": "number (1-10, default: 1)"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "groupId": "group-1",
  "title": "Will Raptors beat Celtics?",
  "category": "sports",
  "status": "open",
  "createdBy": "user-1",
  "deadline": "2026-01-18T18:47:04.688Z",
  "stake": "Buy coffee ☕",
  "winningOutcomeId": null,
  "resolvedAt": null,
  "createdAt": "2026-01-17T18:47:04.688Z",
  "updatedAt": "2026-01-17T18:47:04.688Z",
  "outcomes": [
    {
      "id": "outcome-1",
      "betId": "bet-1",
      "label": "Raptors Win",
      "weight": 6,
      "createdAt": "2026-01-17T18:47:04.691Z"
    }
  ]
}
```

---

#### GET `/api/bets/:id`

Get a bet with outcomes and all entries.

**Response:** `200 OK`
```json
{
  "id": "bet-1",
  "groupId": "group-1",
  "title": "Will Raptors beat Celtics?",
  "category": "sports",
  "status": "open",
  "createdBy": "user-1",
  "deadline": "2026-01-18T18:47:04.688Z",
  "stake": "Buy coffee ☕",
  "winningOutcomeId": null,
  "resolvedAt": null,
  "createdAt": "2026-01-17T18:47:04.688Z",
  "updatedAt": "2026-01-17T18:47:04.688Z",
  "outcomes": [
    {
      "id": "outcome-1",
      "betId": "bet-1",
      "label": "Raptors Win",
      "weight": 6,
      "createdAt": "2026-01-17T18:47:04.691Z",
      "entries": [
        {
          "id": "entry-1",
          "betId": "bet-1",
          "userId": "user-1",
          "outcomeId": "outcome-1",
          "confidence": 85,
          "result": "pending",
          "completedAt": null,
          "proofUrl": null,
          "createdAt": "2026-01-17T18:47:04.697Z",
          "updatedAt": "2026-01-17T18:47:04.697Z"
        }
      ]
    }
  ]
}
```

**Errors:**
- `404 Not Found` - Bet doesn't exist

---

#### PUT `/api/bets/:id`

Update a bet (mark as locked, mark winning outcome, etc).

**Body:** (all optional)
```json
{
  "status": "enum: open|locked|resolved|completed",
  "winningOutcomeId": "uuid",
  "resolvedAt": "ISO8601 date"
}
```

**Response:** `200 OK`
```json
{
  "id": "bet-1",
  "groupId": "group-1",
  "title": "Will Raptors beat Celtics?",
  "category": "sports",
  "status": "resolved",
  "createdBy": "user-1",
  "deadline": "2026-01-18T18:47:04.688Z",
  "stake": "Buy coffee ☕",
  "winningOutcomeId": "outcome-1",
  "resolvedAt": "2026-01-17T19:00:00.000Z",
  "createdAt": "2026-01-17T18:47:04.688Z",
  "updatedAt": "2026-01-17T18:47:04.688Z"
}
```

---

### Entries (User Bets)

#### POST `/api/entries`

Create a new entry (user joins a bet).

**Body:**
```json
{
  "betId": "uuid (required)",
  "userId": "uuid (required)",
  "outcomeId": "uuid (required)",
  "confidence": "number 1-100 (required)"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "betId": "bet-1",
  "userId": "user-1",
  "outcomeId": "outcome-1",
  "confidence": 85,
  "result": "pending",
  "completedAt": null,
  "proofUrl": null,
  "createdAt": "2026-01-17T18:47:04.697Z",
  "updatedAt": "2026-01-17T18:47:04.697Z"
}
```

**Errors:**
- `400 Bad Request` - Missing required fields
- `404 Not Found` - Bet or outcome doesn't exist

---

#### PUT `/api/entries/:id`

Update an entry (update confidence or submit proof).

**Body:** (all optional)
```json
{
  "confidence": "number 1-100",
  "proofUrl": "string",
  "proofDescription": "string"
}
```

**Response:** `200 OK`
```json
{
  "id": "entry-1",
  "betId": "bet-1",
  "userId": "user-1",
  "outcomeId": "outcome-1",
  "confidence": 90,
  "result": "pending",
  "completedAt": null,
  "proofUrl": "https://example.com/proof.jpg",
  "createdAt": "2026-01-17T18:47:04.697Z",
  "updatedAt": "2026-01-17T18:47:04.697Z"
}
```

---

#### PUT `/api/entries/:id/complete`

Mark an entry as complete with a win/loss result. Updates user stats.

**Body:**
```json
{
  "result": "enum: win|loss (required)"
}
```

**Response:** `200 OK`
```json
{
  "entry": {
    "id": "entry-1",
    "betId": "bet-1",
    "userId": "user-1",
    "outcomeId": "outcome-1",
    "confidence": 85,
    "result": "win",
    "completedAt": "2026-01-17T19:00:00.000Z",
    "proofUrl": null,
    "createdAt": "2026-01-17T18:47:04.697Z",
    "updatedAt": "2026-01-17T18:47:04.697Z"
  },
  "userUpdated": {
    "id": "user-1",
    "name": "Jay",
    "emoji": "🤴",
    "wins": 6,
    "losses": 2,
    "streak": 4,
    "createdAt": "2026-01-17T18:47:04.667Z",
    "updatedAt": "2026-01-17T18:47:04.667Z"
  }
}
```

**Errors:**
- `400 Bad Request` - Invalid result value
- `404 Not Found` - Entry doesn't exist

---

#### GET `/api/entries/:userId`

Get all entries for a specific user.

**Response:** `200 OK`
```json
[
  {
    "id": "entry-1",
    "betId": "bet-1",
    "userId": "user-1",
    "outcomeId": "outcome-1",
    "confidence": 85,
    "result": "pending",
    "completedAt": null,
    "proofUrl": null,
    "createdAt": "2026-01-17T18:47:04.697Z",
    "updatedAt": "2026-01-17T18:47:04.697Z",
    "outcome": {
      "id": "outcome-1",
      "betId": "bet-1",
      "label": "Raptors Win",
      "weight": 6,
      "createdAt": "2026-01-17T18:47:04.691Z"
    }
  }
]
```

---

## Database Schema

### Users Table
- `id` - UUID primary key
- `name` - User's display name
- `emoji` - User's avatar emoji
- `wins` - Number of won bets (integer)
- `losses` - Number of lost bets (integer)
- `streak` - Current winning streak (integer)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Groups Table
- `id` - UUID primary key
- `name` - Group name
- `createdBy` - Foreign key to Users
- `inviteCode` - 6-character unique code
- `description` - Optional description
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Bets Table
- `id` - UUID primary key
- `groupId` - Foreign key to Groups
- `title` - Bet title
- `category` - Enum: sports, entertainment, weather, custom
- `status` - Enum: open, locked, resolved, completed
- `createdBy` - Foreign key to Users
- `deadline` - When bets close
- `stake` - Consequence description
- `winningOutcomeId` - Foreign key to Outcomes (when resolved)
- `resolvedAt` - When bet was resolved
- `resolvedBy` - Who resolved it (user ID)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Outcomes Table
- `id` - UUID primary key
- `betId` - Foreign key to Bets
- `label` - Outcome description
- `weight` - Odds weighting (1-10)
- `createdAt` - Timestamp

### Entries Table
- `id` - UUID primary key
- `betId` - Foreign key to Bets
- `userId` - Foreign key to Users
- `outcomeId` - Foreign key to Outcomes
- `confidence` - User's confidence (1-100)
- `result` - Enum: pending, win, loss
- `completedAt` - When consequence was marked complete
- `proofUrl` - URL to proof of completion
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### GroupMembers Table (Junction)
- `userId` - Foreign key to Users
- `groupId` - Foreign key to Groups
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "status": 400
}
```

Common status codes:
- `400 Bad Request` - Invalid input or validation error
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server-side error

---

## Testing with cURL

### Create a user
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","emoji":"👩"}'
```

### Create a group
```bash
curl -X POST http://localhost:3001/api/groups \
  -H "Content-Type: application/json" \
  -d '{"name":"Friends","createdBy":"USER_ID"}'
```

### Join a group
```bash
curl -X POST http://localhost:3001/api/groups/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"ABC123","userId":"USER_ID"}'
```

### Create a bet
```bash
curl -X POST http://localhost:3001/api/bets \
  -H "Content-Type: application/json" \
  -d '{
    "groupId":"GROUP_ID",
    "title":"Will it rain tomorrow?",
    "category":"weather",
    "createdBy":"USER_ID",
    "deadline":"2026-01-18T18:00:00Z",
    "stake":"Buy lunch 🍕",
    "outcomes":[
      {"label":"Yes, rain","weight":5},
      {"label":"No, sunny","weight":5}
    ]
  }'
```

### Join a bet
```bash
curl -X POST http://localhost:3001/api/entries \
  -H "Content-Type: application/json" \
  -d '{"betId":"BET_ID","userId":"USER_ID","outcomeId":"OUTCOME_ID","confidence":75}'
```

### Resolve a bet
```bash
curl -X PUT http://localhost:3001/api/bets/BET_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"resolved","winningOutcomeId":"OUTCOME_ID","resolvedAt":"2026-01-18T19:00:00Z"}'
```

### Complete an entry
```bash
curl -X PUT http://localhost:3001/api/entries/ENTRY_ID/complete \
  -H "Content-Type: application/json" \
  -d '{"result":"win"}'
```

---

## Future Enhancements

- [ ] JWT authentication
- [ ] User email verification
- [ ] Real-time updates with WebSockets
- [ ] Notification system
- [ ] Bet resolution with ML models
- [ ] Payment integration
- [ ] Mobile app
- [ ] Analytics dashboard
