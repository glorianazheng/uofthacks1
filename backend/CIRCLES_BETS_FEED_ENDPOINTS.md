# Circles, Bets & Feed API Endpoints

Complete documentation for circle creation, bet management, and personalized feed functionality.

---

## Circles (Groups)

### 1. Create a Circle
**POST** `/api/circles` or `/api/groups`

Create a new circle with a randomly generated 6-character invite code.

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
    "id": "uuid-here",
    "name": "UofT Hacks Squad",
    "inviteCode": "AB3K9F",
    "createdBy": "creator-uuid",
    "createdAt": "2026-01-17T12:00:00Z"
  },
  "inviteCode": "AB3K9F"
}
```

**Error Responses:**
- `400` - Missing required fields (name, creatorName, creatorEmoji)
- `500` - Server error

---

### 2. Join a Circle
**POST** `/api/groups/join`

Join an existing circle using the 6-character invite code.

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
    "id": "new-user-uuid",
    "name": "Jordan",
    "emoji": "⚡",
    "wins": 0,
    "losses": 0,
    "streak": 0
  },
  "group": {
    "id": "group-uuid",
    "name": "UofT Hacks Squad",
    "inviteCode": "AB3K9F"
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `404` - Invalid invite code

---

### 3. Get Circle Details
**GET** `/api/groups/:groupId`

Get circle info with all members.

**Response (200):**
```json
{
  "id": "group-uuid",
  "name": "UofT Hacks Squad",
  "inviteCode": "AB3K9F",
  "createdBy": "creator-uuid",
  "members": [
    {
      "id": "user-1-uuid",
      "name": "Alex",
      "emoji": "🚀"
    },
    {
      "id": "user-2-uuid",
      "name": "Jordan",
      "emoji": "⚡"
    }
  ]
}
```

---

## Bets

### 1. Create a Bet
**POST** `/api/bets`

Circle host creates a bet with multiple outcomes, a stake, and deadline.

**Request:**
```json
{
  "groupId": "group-uuid",
  "title": "Will the Raptors beat the Lakers?",
  "category": "sports",
  "createdBy": "creator-user-uuid",
  "deadline": "2026-01-20T23:59:59Z",
  "stake": "Buy the loser bubble tea 🧋",
  "outcomes": [
    {
      "label": "Raptors Win",
      "weight": 5
    },
    {
      "label": "Lakers Win",
      "weight": 5
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Bet \"Will the Raptors beat the Lakers?\" created with 2 options. Deadline: 2026-01-20T23:59:59Z",
  "bet": {
    "id": "bet-uuid",
    "groupId": "group-uuid",
    "title": "Will the Raptors beat the Lakers?",
    "category": "sports",
    "status": "open",
    "createdBy": "creator-uuid",
    "deadline": "2026-01-20T23:59:59Z",
    "stake": "Buy the loser bubble tea 🧋",
    "outcomes": [
      {
        "id": "outcome-1-uuid",
        "label": "Raptors Win",
        "weight": 5
      },
      {
        "id": "outcome-2-uuid",
        "label": "Lakers Win",
        "weight": 5
      }
    ]
  }
}
```

**Validation Rules:**
- `groupId`, `title`, `createdBy`, `deadline`, `stake` are required
- At least 2 outcomes required
- Deadline must be in the future
- Each outcome needs a label and optional weight (defaults to 1)

**Error Responses:**
- `400` - Missing fields or invalid deadline
- `404` - Group not found

---

### 2. Join a Bet
**POST** `/api/bets/:betId/join`

User picks a side and sets their confidence level (1-10).

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
  "message": "Successfully joined bet!",
  "entry": {
    "id": "entry-uuid",
    "betId": "bet-uuid",
    "userId": "user-uuid",
    "outcomeId": "outcome-uuid",
    "confidence": 8,
    "result": "pending"
  }
}
```

**Auto-Lock Logic:**
- If the current time exceeds the bet deadline, the bet is automatically locked
- Users cannot join a locked or resolved bet
- Returns error with deadline information if bet is locked

**Error Responses:**
- `400` - Invalid confidence (must be 1-10) or bet is locked/resolved
- `404` - Bet or outcome not found

---

### 3. Get Bets in a Circle
**GET** `/api/groups/:groupId/bets`

Get all bets in a circle with their outcomes and entries.

**Response (200):**
```json
{
  "groupId": "group-uuid",
  "betCount": 2,
  "bets": [
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
          "weight": 5,
          "entries": [...]
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

Fetch all active bets from:
1. Circles the user belongs to
2. Public bets from users they follow

Results are sorted by deadline (soonest first).

**Response (200):**
```json
{
  "userId": "user-uuid",
  "betCount": 5,
  "circleCount": 2,
  "followingCount": 3,
  "bets": [
    {
      "id": "bet-uuid-1",
      "title": "Will the Raptors beat the Lakers?",
      "category": "sports",
      "status": "open",
      "deadline": "2026-01-19T23:59:59Z",
      "stake": "Buy the loser bubble tea 🧋",
      "creator": {
        "id": "creator-uuid",
        "name": "Alex",
        "emoji": "🚀",
        "wins": 5,
        "losses": 2
      },
      "group": {
        "id": "group-uuid",
        "name": "UofT Hacks Squad",
        "inviteCode": "AB3K9F"
      },
      "outcomes": [
        {
          "id": "outcome-uuid",
          "label": "Raptors Win",
          "weight": 5
        }
      ]
    }
  ]
}
```

**Logic:**
- Returns only **open** bets (not locked or resolved)
- Includes bets from user's circles (via GroupMember)
- Includes bets from followed users (via Friendship)
- Deduplicates bets (if a followed user is in same circle, bet appears once)
- Sorts by deadline ascending (soonest deadline first)

**Metadata Included:**
- `betCount` - Total active bets in feed
- `circleCount` - Number of circles user is in
- `followingCount` - Number of users they follow

**Error Responses:**
- `404` - User not found

---

## Example User Journey

### Step 1: Create a Circle
```bash
POST /api/circles
{
  "name": "Study Buddies",
  "creatorName": "Gloria",
  "creatorEmoji": "📚"
}
# Returns: inviteCode "K9F3X2"
```

### Step 2: Friends Join the Circle
```bash
POST /api/groups/join
{
  "name": "Sam",
  "emoji": "🎮",
  "inviteCode": "K9F3X2"
}
```

### Step 3: Create a Bet
```bash
POST /api/bets
{
  "groupId": "group-uuid",
  "title": "Who will finish the assignment first?",
  "category": "custom",
  "createdBy": "gloria-uuid",
  "deadline": "2026-01-19T17:00:00Z",
  "stake": "Buy coffee for the winner ☕",
  "outcomes": [
    { "label": "Gloria", "weight": 5 },
    { "label": "Sam", "weight": 5 },
    { "label": "Both tie", "weight": 3 }
  ]
}
```

### Step 4: Friends Join the Bet
```bash
POST /api/bets/bet-uuid/join
{
  "userId": "sam-uuid",
  "outcomeId": "sam-outcome-uuid",
  "confidence": 7
}
```

### Step 5: Check Your Feed
```bash
GET /api/feed/gloria-uuid
# Returns all active bets from her circles and followed users
```

---

## Notes

### Invite Code Generation
- 6-character alphanumeric code
- Automatically generated and unique per circle
- Used for easy sharing and joining

### Bet Lifecycle
- **Open**: Accepting entries, deadline not passed
- **Locked**: Deadline passed, no new entries allowed
- **Resolved**: Winner determined, consequences assigned
- **Completed**: All consequences fulfilled

### Confidence Slider
- Range: 1-10
- 1 = least confident in the outcome
- 10 = most confident in the outcome
- Used to weight the random selection of losers

### Feed Algorithm
- Combines circle bets + following bets
- Removes duplicates (same bet ID)
- Sorts by deadline ascending
- Only includes "open" status bets
- Provides context (creator, circle, outcomes) for each bet
