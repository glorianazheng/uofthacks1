# 🎲 Betting API Quick Reference

## Create a Bet

```bash
POST /api/bets
{
  "groupId": "group-uuid",
  "title": "Raptors vs Lakers",
  "category": "sports",
  "createdBy": "host-user-id",
  "deadline": "2026-01-17T20:30:00Z",
  "stake": "Loser buys boba 🧋",
  "outcomes": [
    { "label": "Raptors Win" },
    { "label": "Lakers Win" }
  ]
}
```

**Returns:** Bet ID, outcome IDs

---

## Join a Bet

```bash
POST /api/bets/{betId}/join
{
  "userId": "user-uuid",
  "outcomeId": "outcome-uuid",
  "confidence": 8
}
```

**Confidence:** 1-10 slider
**Auto-locks:** If deadline has passed

---

## Resolve a Bet (Pick Loser)

```bash
PATCH /api/bets/{betId}/resolve
{
  "winningOutcomeId": "outcome-uuid"
}
```

**Returns:**
- ✅ Chosen loser name & emoji
- ✅ Their chore
- ✅ Selection probability (e.g., 63.6%)
- ✅ Updated user stats

---

## Weighted Roulette

Higher confidence = Higher chance of being picked

```
Probability = Your Confidence / Sum of Losers' Confidence

Example:
  Bob: 7/10 confidence → 70% chance
  Charlie: 4/10 confidence → 30% chance
```

---

## User Stats Update

**Winners:**
- wins += 1
- streak += 1

**Chosen Loser:**
- losses += 1
- streak = 0

**Non-Chosen Losers:**
- No change (they escaped!)

---

## Test Everything

```bash
./test_betting_resolution.sh
```

Shows complete flow:
- Group creation
- Members joining
- Bet creation
- Members picking sides
- Bet resolution with weighted roulette
- Stats verification

---

## Common Issues

### "Cannot join bet. Bet status is 'locked'"
→ Deadline has passed

### "Confidence must be between 1 and 10"
→ Use values 1-10, not 0-100

### "winningOutcomeId is required"
→ Must specify which outcome won

---

## Response Examples

### Bet Created
```json
{
  "bet": {
    "id": "abc123",
    "title": "Raptors vs Lakers",
    "status": "open",
    "deadline": "2026-01-17T20:30:00Z"
  }
}
```

### Joined Bet
```json
{
  "message": "Alice 👩 joined - picking Raptors with 8/10 confidence!",
  "confidenceSlider": 8,
  "confidencePercentage": 80
}
```

### Bet Resolved
```json
{
  "chosenLoser": {
    "name": "Bob",
    "emoji": "👨",
    "chore": "Loser buys boba 🧋",
    "probabilityOfSelection": "63.6%"
  }
}
```

---

## Full Documentation

See `BETTING_RESOLUTION.md` for:
- Complete endpoint specifications
- Algorithm explanation
- Error handling
- Edge cases
- Implementation details

---

**Status:** ✅ Ready for production
