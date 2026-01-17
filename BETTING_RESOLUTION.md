# 🎲 Bet Resolution & Weighted Roulette API

## Overview

The bet resolution system implements **Weighted Roulette** logic to pick ONE loser from those who picked the losing outcome. The probability of being picked is proportional to their confidence level.

---

## Endpoint: PATCH /api/bets/:id/resolve

### Purpose
Resolve a completed bet by:
1. Identifying all users who picked the losing outcome
2. Using weighted roulette to pick ONE loser based on confidence levels
3. Assigning the chore to the chosen loser
4. Updating user statistics (wins/losses/streak)

### Request

```bash
PATCH /api/bets/:id/resolve
Content-Type: application/json

{
  "winningOutcomeId": "387b3c52-c5f8-4680-8309-66d488168b1a"
}
```

**Body Parameters:**
- `winningOutcomeId` (string, required): UUID of the winning outcome

### Response (201)

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
      {
        "name": "Bob",
        "emoji": "👨",
        "confidence": 70,
        "confidenceSlider": 7,
        "selectionProbability": "63.6%"
      },
      {
        "name": "Charlie",
        "emoji": "🧑",
        "confidence": 40,
        "confidenceSlider": 4,
        "selectionProbability": "36.4%"
      }
    ]
  }
}
```

---

## Weighted Roulette Algorithm

### How It Works

The weighted roulette implementation picks ONE loser with probability proportional to their confidence:

```
Probability of being picked = User's Confidence / Sum of All Losers' Confidence
```

### Example

**Bet:** Raptors vs Lakers
**Outcome:** Raptors Win

**Losers:**
- Bob picked Lakers with 7/10 confidence → 70%
- Charlie picked Lakers with 4/10 confidence → 40%

**Calculation:**
- Total confidence: 70 + 40 = 110
- Bob's probability: 70/110 = **63.6%**
- Charlie's probability: 40/110 = **36.4%**

**Result:** 
- Random number between 0-1 is generated
- If 0 ≤ random < 0.636 → Bob is chosen
- If 0.636 ≤ random < 1.0 → Charlie is chosen

### Why This Makes Sense

Users who are MORE CONFIDENT in their pick should have a HIGHER chance of being chosen as the loser. This creates:
- **Accountability:** "You were confident, now face the consequences!"
- **Stakes:** Higher confidence = higher stakes
- **Fairness:** The roulette is transparent and mathematically fair based on confidence

---

## User Statistics Updates

When a bet is resolved:

### Winners
Each user who picked the correct outcome gets:
- `wins` += 1
- `streak` += 1 (or reset to 1 if on loss streak)

### Loser (Chosen One)
The picked loser gets:
- `losses` += 1
- `streak` = 0 (streak resets on loss)

### Non-Chosen Losers
Users who picked wrong but weren't chosen:
- No statistics update (they escaped!)
- Still owe nothing

---

## Error Handling

### 400 Bad Request
```json
{
  "error": "winningOutcomeId is required"
}
```

### 404 Not Found
```json
{
  "error": "Bet not found"
}
```

```json
{
  "error": "Winning outcome not found for this bet"
}
```

---

## Special Case: No Losers

If everyone picked the correct outcome:

```json
{
  "message": "Bet resolved! Everyone picked the correct outcome!",
  "bet": { ... },
  "chosenLoser": null,
  "totalLosers": 0
}
```

---

## Complete Flow Example

### Setup
```bash
# 1. Create group
POST /api/groups
{
  "name": "Game Night Crew",
  "creatorName": "Host",
  "creatorEmoji": "🎮"
}
# Response: inviteCode = "T0DROY"

# 2. Members join group
POST /api/groups/join
{
  "name": "Alice",
  "emoji": "👩",
  "inviteCode": "T0DROY"
}

# 3. Create bet
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
# Response: bet.id = "15398a0c-975e-44fc-9dc5-aed3f9b4abee"

# 4. Members join bet with confidence
POST /api/bets/15398a0c-975e-44fc-9dc5-aed3f9b4abee/join
{
  "userId": "alice-id",
  "outcomeId": "raptors-outcome-id",
  "confidence": 9
}

POST /api/bets/15398a0c-975e-44fc-9dc5-aed3f9b4abee/join
{
  "userId": "bob-id",
  "outcomeId": "lakers-outcome-id",
  "confidence": 7
}

# ... more members join ...

# 5. Resolve the bet
PATCH /api/bets/15398a0c-975e-44fc-9dc5-aed3f9b4abee/resolve
{
  "winningOutcomeId": "raptors-outcome-id"
}
# Response: Bob is chosen as loser! (63.6% probability)
```

---

## Testing

Run the comprehensive test:
```bash
chmod +x test_betting_resolution.sh
./test_betting_resolution.sh
```

This test:
- ✅ Creates a group with 4 members
- ✅ Creates a bet with 2 outcomes
- ✅ All members join with varying confidence (4-9)
- ✅ Resolves the bet
- ✅ Shows weighted roulette picking a loser based on confidence
- ✅ Verifies user statistics were updated correctly

---

## Implementation Details

### Confidence Conversion
- User input: 1-10 (slider)
- Stored as: 10-100 (percentage)
- Used in roulette: 1-100 (weights)
- Returned in response: 1-10 (slider value)

### Randomness
Uses JavaScript's `Math.random()` for fair distribution. The roulette wheel assigns each loser a segment proportional to their confidence, then a random spin picks the loser.

### Database Updates
All changes are saved immediately:
- Bet status → "resolved"
- Winning outcome recorded
- User wins/losses/streak updated
- All in a single atomic operation per user

---

## API Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/bets` | Create a bet with outcomes |
| GET | `/api/bets/:id` | Get bet details with entries |
| POST | `/api/bets/:id/join` | Join a bet with confidence |
| **PATCH** | **`/api/bets/:id/resolve`** | **Resolve bet & pick loser** |
| PUT | `/api/bets/:id` | Update bet status |

---

## Next Steps

Once bets are resolved, consider:
- Tracking historical consequences completed
- Streak tracking for "Curse of the Loser"
- Bet history and leaderboards
- Photos/proof of completed chores
