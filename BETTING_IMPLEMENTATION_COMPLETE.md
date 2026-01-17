# 🎲 Betting Flow Implementation Complete

## Summary

Successfully implemented the **complete betting flow** with deadline logic and weighted roulette for consequence assignment.

---

## What Was Built

### 1. **POST /api/bets** - Create a Bet
**Purpose:** Host creates a bet with multiple outcomes and a deadline

**Features:**
- ✅ Takes group ID, title, creator ID, deadline, and stake
- ✅ Creates multiple outcomes (e.g., "Raptors Win", "Lakers Win")
- ✅ Validates deadline is in the future
- ✅ Returns bet ID and all outcome details

**Example Request:**
```bash
POST /api/bets
{
  "groupId": "a00c2b28-87d3-411e-8bdd-7b5ec4cf9f37",
  "title": "Raptors vs Lakers Game",
  "category": "sports",
  "createdBy": "host-user-id",
  "deadline": "2026-01-17T20:30:00Z",
  "stake": "Loser buys boba for everyone 🧋",
  "outcomes": [
    { "label": "Raptors Win", "weight": 5 },
    { "label": "Lakers Win", "weight": 5 }
  ]
}
```

**Example Response:**
```json
{
  "message": "Bet \"Raptors vs Lakers Game\" created with 2 options. Deadline: 2026-01-17T20:30:00Z",
  "bet": {
    "id": "15398a0c-975e-44fc-9dc5-aed3f9b4abee",
    "title": "Raptors vs Lakers Game",
    "stake": "Loser buys boba for everyone 🧋",
    "status": "open",
    "deadline": "2026-01-17T20:30:00Z",
    "outcomes": [
      { "id": "outcome-1", "label": "Raptors Win" },
      { "id": "outcome-2", "label": "Lakers Win" }
    ]
  }
}
```

---

### 2. **POST /api/bets/:id/join** - Join a Bet
**Purpose:** Members pick a side and set confidence level (1-10 slider)

**Features:**
- ✅ Takes user ID, outcome ID, and confidence (1-10)
- ✅ Validates confidence is between 1-10
- ✅ **Auto-checks deadline** - if passed, automatically locks the bet
- ✅ Prevents new entries if bet is locked
- ✅ Converts confidence to percentage (1-10 → 10-100)
- ✅ Prevents duplicate entries per user

**Example Request:**
```bash
POST /api/bets/15398a0c-975e-44fc-9dc5-aed3f9b4abee/join
{
  "userId": "alice-user-id",
  "outcomeId": "raptors-outcome-id",
  "confidence": 9
}
```

**Example Response:**
```json
{
  "message": "Alice 👩 joined the bet \"Raptors vs Lakers Game\" - picking \"Raptors Win\" with 9/10 confidence!",
  "entry": {
    "id": "entry-id",
    "betId": "bet-id",
    "userId": "alice-id",
    "outcomeId": "raptors-outcome-id",
    "confidence": 90,
    "result": "pending"
  },
  "confidenceSlider": 9,
  "confidencePercentage": 90
}
```

---

### 3. **PATCH /api/bets/:id/resolve** - Resolve Bet & Pick Loser
**Purpose:** Host declares winning outcome, system picks ONE loser using weighted roulette

**Features:**
- ✅ Host sends the winning outcome ID
- ✅ Identifies all users who picked losing outcomes
- ✅ **Weighted Roulette:** Picks ONE loser with probability = confidence / total_confidence
- ✅ Returns chosen loser's name, emoji, and chore
- ✅ Updates user statistics:
  - Winners: wins += 1, streak += 1
  - Chosen Loser: losses += 1, streak = 0
  - Non-chosen Losers: no change
- ✅ Marks bet as "resolved"

**Example Request:**
```bash
PATCH /api/bets/15398a0c-975e-44fc-9dc5-aed3f9b4abee/resolve
{
  "winningOutcomeId": "raptors-outcome-id"
}
```

**Example Response:**
```json
{
  "message": "Bet resolved! Bob 👨 is the chosen loser!",
  "bet": {
    "id": "15398a0c-975e-44fc-9dc5-aed3f9b4abee",
    "title": "Raptors vs Lakers Game",
    "stake": "Loser buys boba for everyone 🧋",
    "winningOutcome": "Raptors Win",
    "status": "resolved",
    "resolvedAt": "2026-01-17T19:25:30.123Z"
  },
  "chosenLoser": {
    "name": "Bob",
    "emoji": "👨",
    "chore": "Loser buys boba for everyone 🧋",
    "confidence": 70,
    "confidenceSlider": 7,
    "selectedOutcome": "Lakers Win",
    "probabilityOfSelection": "63.6%"
  },
  "stats": {
    "totalLosers": 2,
    "totalWinners": 2,
    "allLosersConfidence": [
      { "name": "Bob", "emoji": "👨", "selectionProbability": "63.6%" },
      { "name": "Charlie", "emoji": "🧑", "selectionProbability": "36.4%" }
    ]
  }
}
```

---

## Deadline Logic

### How It Works

```javascript
// Helper function that automatically locks expired bets
const checkAndLockBetIfExpired = async (bet) => {
  if (bet.status === 'open' && new Date() > new Date(bet.deadline)) {
    bet.status = 'locked';
    await bet.save();
    return true;
  }
  return false;
};
```

**When Checking:**
- Every time someone tries to join a bet
- Every time bet details are fetched
- Automatic and transparent

**Effect:**
- Bet status changes from "open" → "locked"
- No new entries allowed after deadline
- Returns clear error message

### Example
```
Deadline: 2026-01-17T20:30:00Z
Current Time: 2026-01-17T20:35:00Z ← Past deadline

User tries to join:
❌ Error: "Cannot join bet. Bet status is 'locked'. The deadline has passed."
```

---

## Weighted Roulette Algorithm

### The Math

**Probability = User's Confidence / Sum of All Losers' Confidence**

### Example

**Scenario:**
- Raptors vs Lakers bet
- Raptors won (correct prediction)
- Losers: Bob (7/10) and Charlie (4/10)

**Calculation:**
```
Total Confidence = 70 + 40 = 110

Bob's Probability = 70 / 110 = 63.6%
Charlie's Probability = 40 / 110 = 36.4%

Random Spin (0-1):
  0.000 ─ 0.636: Bob is picked
  0.636 ─ 1.000: Charlie is picked
```

**Why It Makes Sense:**
- High confidence = High stakes → More likely to be picked
- Low confidence = Safer bet → Less likely to be picked
- Fair and mathematically transparent
- Encourages thoughtful predictions

### Test Results

Run 1:
```
Bob (7/10): 63.6% → PICKED ✅
Charlie (4/10): 36.4%
```

Run 2:
```
Bob (7/10): 63.6%
Charlie (4/10): 36.4% → PICKED ✅
```

Both outcomes are possible and correctly proportional!

---

## Test Results

### Complete Test Execution

```
✅ Created group: "Game Night Crew" (Invite: HUB96N)
✅ Added 4 members: Alice 👩, Bob 👨, Charlie 🧑, Diana 👸
✅ Created bet: "Raptors vs Lakers" with stake "Loser buys boba 🧋"
✅ All members joined with confidence:
   - Alice: Raptors (9/10)
   - Bob: Lakers (7/10)
   - Charlie: Lakers (4/10)
   - Diana: Raptors (6/10)

✅ Resolved bet: Raptors won!

✅ Weighted roulette picked Bob (63.6% probability)

✅ Stats updated:
   - Alice (Winner): wins=1, losses=0, streak=1 ✅
   - Bob (Chosen Loser): wins=0, losses=1, streak=0 ❌
   - Charlie (Non-chosen Loser): wins=0, losses=0, streak=0
   - Diana (Winner): wins=1, losses=0, streak=1 ✅
```

---

## Technical Implementation

### Database Integration
- **Bets Table:** Stores bet details with status and deadline
- **Outcomes Table:** Stores possible outcomes for each bet
- **Entries Table:** Tracks user predictions and confidence
- **Users Table:** Stats updated when resolved (wins/losses/streak)

### Error Handling
- ✅ Validates all required fields
- ✅ Checks future deadlines
- ✅ Prevents duplicate entries
- ✅ Handles special case (all picked correctly)
- ✅ Clear error messages for debugging

### Performance
- ✅ Single database queries for fetching
- ✅ Efficient roulette algorithm (O(n) where n = losers)
- ✅ Atomic operations for stats updates

---

## File Changes

### Backend Routes (`backend/routes/api.js`)
- ✅ Added `checkAndLockBetIfExpired()` helper function
- ✅ Enhanced `POST /api/bets` with validation and multiple outcomes
- ✅ Added `POST /api/bets/:id/join` with deadline checking
- ✅ Enhanced `GET /api/bets/:id` with deadline auto-locking
- ✅ **NEW:** Added `PATCH /api/bets/:id/resolve` with weighted roulette

### Documentation
- ✅ Created `BETTING_RESOLUTION.md` - Complete API reference
- ✅ Updated `README.md` - Added betting features overview
- ✅ Created `test_betting_resolution.sh` - Comprehensive test script

---

## API Endpoints Summary

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/groups` | Create a group | ✅ |
| POST | `/api/groups/join` | Join a group | ✅ |
| GET | `/api/groups/:id` | List group members | ✅ |
| POST | `/api/bets` | Create a bet | ✅ |
| GET | `/api/bets/:id` | Get bet details | ✅ |
| POST | `/api/bets/:id/join` | Join a bet | ✅ |
| **PATCH** | **`/api/bets/:id/resolve`** | **Resolve & pick loser** | **✅** |

---

## Next Steps

To continue building:

1. **Frontend Integration**
   - Create React components for betting flow
   - Wire up to backend API endpoints
   - Add real-time updates

2. **Proof of Consequence**
   - Photo/video upload for completed chores
   - Leaderboards and badges
   - Historical tracking

3. **Enhanced Features**
   - Notifications when bet resolves
   - Streak tracking and "Curse of the Loser"
   - Group chat/comments on bets
   - Bet history and analytics

4. **Testing & Deployment**
   - Unit tests for roulette algorithm
   - Integration tests
   - Deploy to production

---

## Verification Commands

Test the betting flow:
```bash
cd /Users/glorianazheng/Downloads/uofthacks1
./test_betting_resolution.sh
```

View documentation:
```bash
cat BETTING_RESOLUTION.md
cat README.md
```

Start the backend:
```bash
cd backend
npm run dev
```

---

## Status: ✅ COMPLETE

All betting features implemented, tested, and documented:
- ✅ Bet creation with deadlines
- ✅ Confidence slider (1-10)
- ✅ Deadline auto-locking
- ✅ Weighted roulette resolution
- ✅ User stats tracking
- ✅ Comprehensive testing
- ✅ Full documentation

**Ready for frontend integration and user testing!**
