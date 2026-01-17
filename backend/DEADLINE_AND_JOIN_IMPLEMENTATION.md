# Deadline & Bet Join Implementation

This document outlines the deadline checking middleware and bet joining route that are already implemented in the backend.

---

## Middleware: `checkAndLockBetIfExpired`

**Purpose:** Automatically lock a bet if the current time has passed its deadline.

**Location:** `/backend/routes/api.js` (lines 370-379)

**Implementation:**
```javascript
const checkAndLockBetIfExpired = async (bet) => {
  if (bet.status === 'open' && new Date() > new Date(bet.deadline)) {
    bet.status = 'locked';
    await bet.save();
    return true; // Was locked
  }
  return false; // Was already locked or deadline hasn't passed
};
```

**Logic:**
1. Checks if bet status is currently `'open'`
2. Compares current time with bet's deadline
3. If current time > deadline:
   - Updates bet status to `'locked'`
   - Persists change to database
   - Returns `true` (was just locked)
4. Otherwise returns `false`

**Usage:**
- Called before any user joins a bet
- Ensures bets are locked automatically without manual intervention
- No duplicate locks (only locks if status is 'open')

---

## Route: POST `/api/bets/:id/join`

**Purpose:** Allow a user to select an outcome and join an active bet with a confidence level.

**Location:** `/backend/routes/api.js` (lines 457-565)

**Request Body:**
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
    "result": "pending",
    "User": { ... },
    "Outcome": { ... }
  },
  "confidenceSlider": 8,
  "confidencePercentage": 80,
  "bet": {
    "id": "bet-uuid",
    "title": "Will Raptors win?",
    "deadline": "2026-01-20T23:59:59Z"
  }
}
```

---

## Complete Flow & Validation

### 1. Request Validation
```javascript
if (!userId || !outcomeId || confidence === undefined) {
  // Missing required fields
  return 400 error
}

if (confidence < 1 || confidence > 10) {
  // Confidence outside valid range
  return 400 error
}
```

### 2. Bet Lookup & Deadline Check
```javascript
const bet = await Bet.findByPk(req.params.id);
if (!bet) {
  return 404 error // Bet not found
}

// AUTO-LOCK: Check deadline and lock if necessary
const wasJustLocked = await checkAndLockBetIfExpired(bet);
```

### 3. Status Verification
```javascript
if (bet.status !== 'open') {
  return 400 error with:
    - betStatus (current status)
    - deadline (when it closed)
    - currentTime (when request was made)
    - Message indicating why join failed
}
```

**Possible Status Values:**
- `'open'` - Can join ✅
- `'locked'` - Cannot join (deadline passed) ❌
- `'resolved'` - Cannot join (winner determined) ❌
- `'completed'` - Cannot join (done) ❌

### 4. User & Outcome Verification
```javascript
// Verify user exists
const user = await User.findByPk(userId);
if (!user) {
  return 404 error
}

// Verify outcome exists AND belongs to this bet
const outcome = await Outcome.findByPk(outcomeId);
if (!outcome || outcome.betId !== bet.id) {
  return 404 error
}
```

### 5. Duplicate Entry Check
```javascript
// Prevent user from entering same bet twice
const existingEntry = await Entry.findOne({
  where: {
    betId: bet.id,
    userId: userId,
  },
});

if (existingEntry) {
  return 400 error // Already joined
}
```

### 6. Entry Creation
```javascript
// Convert confidence 1-10 to percentage 10-100 for weighting
const confidencePercentage = confidence * 10;

const entry = await Entry.create({
  id: uuidv4(),
  betId: bet.id,
  userId: userId,
  outcomeId: outcomeId,
  confidence: confidencePercentage,  // 80% for confidence 8
  result: 'pending',
});
```

---

## Key Features

### ✅ Automatic Deadline Enforcement
- No need to manually lock bets
- Happens transparently when user tries to join
- Clear error message if they try after deadline

### ✅ Robust Validation
- User exists
- Outcome exists and belongs to the bet
- No duplicate entries per user per bet
- Confidence in valid range (1-10)

### ✅ Confidence Conversion
- User sees 1-10 slider
- Stored as 10-100% internally
- Used for weighted random selection of losers

### ✅ Detailed Error Messages
```json
{
  "error": "Cannot join bet. Bet status is \"locked\". The deadline has passed.",
  "betStatus": "locked",
  "deadline": "2026-01-20T23:59:59Z",
  "currentTime": "2026-01-21T00:30:00Z"
}
```

### ✅ Rich Response
- Entry details with user and outcome
- Confidence shown both ways (1-10 and 10-100%)
- Bet summary (title, deadline)
- Friendly success message with emoji

---

## Example Usage

### Request
```bash
curl -X POST http://localhost:3001/api/bets/bet-uuid/join \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "outcomeId": "outcome-uuid",
    "confidence": 7
  }'
```

### Success Response (Before Deadline)
```json
{
  "message": "Jordan ⚡ joined the bet \"Will Raptors win?\" - picking \"Raptors Win\" with 7/10 confidence!",
  "entry": {
    "id": "entry-uuid",
    "betId": "bet-uuid",
    "userId": "user-uuid",
    "outcomeId": "outcome-uuid",
    "confidence": 70,
    "result": "pending"
  },
  "confidenceSlider": 7,
  "confidencePercentage": 70
}
```

### Error Response (After Deadline)
```json
{
  "error": "Cannot join bet. Bet status is \"locked\". The deadline has passed.",
  "betStatus": "locked",
  "deadline": "2026-01-20T23:59:59Z",
  "currentTime": "2026-01-21T00:30:00Z"
}
```

### Error Response (Duplicate Entry)
```json
{
  "error": "User already has an entry for this bet"
}
```

### Error Response (Invalid Confidence)
```json
{
  "error": "Confidence must be between 1 and 10"
}
```

---

## Database Impact

### Entry Created With:
- `id`: UUID
- `betId`: References the bet
- `userId`: References the user
- `outcomeId`: References the chosen outcome
- `confidence`: 10-100% (from 1-10 slider)
- `result`: Initially 'pending' (changes to 'win' or 'loss' when bet resolves)
- `createdAt`: Timestamp

### Bet Updated If Needed:
- Status changed from 'open' → 'locked' if deadline passed
- `updatedAt` timestamp refreshed

---

## Related Routes

### Get Bet Details (with entries)
**GET** `/api/bets/:betId`
- Shows all entries that have joined
- Useful for seeing who's in the bet and their confidence

### Resolve Bet
**PUT** `/api/bets/:betId/resolve`
- Sets winning outcome
- Marks entries as 'win' or 'loss'
- Selects losers based on weighted confidence

### Get User Entries
**GET** `/api/users/:userId/entries`
- Shows all bets the user has joined
- Includes pending, win, and loss results

---

## Testing the Implementation

### Test 1: Join Before Deadline
```bash
# Should succeed
curl -X POST http://localhost:3001/api/bets/{betId}/join \
  -d '{"userId": "{userId}", "outcomeId": "{outcomeId}", "confidence": 5}'
```

### Test 2: Join After Deadline
```bash
# Should fail with "locked" error
curl -X POST http://localhost:3001/api/bets/{betId}/join \
  -d '{"userId": "{userId}", "outcomeId": "{outcomeId}", "confidence": 5}'
```

### Test 3: Duplicate Entry
```bash
# Should fail with "already has an entry" error
curl -X POST http://localhost:3001/api/bets/{betId}/join \
  -d '{"userId": "{sameUserId}", "outcomeId": "{outcomeId}", "confidence": 7}'
```

### Test 4: Invalid Confidence
```bash
# Should fail with "must be between 1 and 10" error
curl -X POST http://localhost:3001/api/bets/{betId}/join \
  -d '{"userId": "{userId}", "outcomeId": "{outcomeId}", "confidence": 15}'
```

---

## Frontend Integration

When implementing the frontend bet join form:

1. **Render confidence slider** (1-10)
   ```jsx
   <input type="range" min="1" max="10" value={confidence} />
   ```

2. **Show selected outcome** clearly

3. **Show deadline countdown** to indicate when joining closes

4. **Handle locked bet error gracefully**
   ```jsx
   if (error.betStatus === 'locked') {
     // Show "Sorry, betting closed!" message
     // Show deadline that passed
   }
   ```

5. **Prevent duplicate joins** on frontend
   ```jsx
   // Disable button if user already joined this bet
   ```
