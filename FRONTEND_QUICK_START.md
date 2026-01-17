# Frontend Developer Quick Start

Essential information for integrating the frontend with the backend API.

---

## Backend Server

**Start the server:**
```bash
cd backend
npm run dev
```

**Base URL:** `http://localhost:3001/api`

**All endpoints prefixed with `/api`**

Example: `POST http://localhost:3001/api/auth/signup`

---

## Essential Endpoints (In Order of Implementation)

### 1. Authentication
```
POST /auth/signup
POST /auth/login
```

### 2. Circles
```
POST /circles           (Create with auto-generated code)
POST /groups/join       (Join with code)
GET /groups/:groupId    (View members)
```

### 3. Bets
```
POST /bets                  (Create with outcomes)
POST /bets/:id/join         (Join with confidence 1-10)
GET /bets/:id               (View details)
PUT /bets/:id/resolve       (Resolve & assign losers)
```

### 4. Feed
```
GET /feed/:userId    (Personalized bets from circles + following)
```

### 5. Friends
```
POST /friends/add             (Follow user)
POST /friends/accept          (Mutual friend)
GET /friends/list/:userId     (View connections)
```

---

## Quick Implementation Path

### Phase 1: Auth + Home
1. Signup/Login page
2. Store userId in localStorage
3. Home page feeds from GET /feed/:userId
4. Display user stats (wins, losses, streak)

### Phase 2: Create & Join
1. Create circle button → POST /circles
2. Show invite code (copy to clipboard)
3. Create bet form → POST /bets
4. Join bet with confidence slider → POST /bets/:id/join

### Phase 3: Social
1. Follow users → POST /friends/add
2. View friends → GET /friends/list/:userId
3. See followed users' bets in feed

### Phase 4: Polish
1. Resolve bets → PUT /bets/:id/resolve
2. Leaderboard
3. Notifications

---

## Common Request Headers

```javascript
const headers = {
  'Content-Type': 'application/json'
};
```

**Note:** No JWT tokens yet - just send requests directly

---

## Response Structure

### Success (2xx)
```json
{
  "id": "uuid",
  "name": "string",
  "status": "enum",
  // ... resource fields
}
```

### Error (4xx/5xx)
```json
{
  "error": "Human-readable error message",
  "status": 400
}
```

---

## Key Field Formats

### User
```javascript
{
  id: "uuid",
  username: "string (3+ chars)",
  name: "string",
  emoji: "string",
  wins: 0,
  losses: 0,
  streak: 0
}
```

### Circle
```javascript
{
  id: "uuid",
  name: "string",
  inviteCode: "6-CHAR-CODE",  // Share this!
  members: [{ id, name, emoji }]
}
```

### Bet
```javascript
{
  id: "uuid",
  title: "string",
  status: "open|locked|resolved|completed",
  deadline: "2026-01-20T23:59:59Z",
  stake: "string",
  outcomes: [
    {
      id: "uuid",
      label: "string",
      weight: 5
    }
  ]
}
```

### Entry (User's bet)
```javascript
{
  id: "uuid",
  betId: "uuid",
  userId: "uuid",
  outcomeId: "uuid",
  confidence: 80,  // 10-100 (from 1-10 slider)
  result: "pending|win|loss"
}
```

---

## Example API Calls

### Sign Up
```javascript
const response = await fetch('http://localhost:3001/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'gloria_z',
    password: 'Pass123!',
    name: 'Gloria',
    emoji: '📚'
  })
});
const user = await response.json();
localStorage.setItem('userId', user.id);
```

### Create Circle
```javascript
const response = await fetch('http://localhost:3001/api/circles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Study Squad',
    creatorName: 'Gloria',
    creatorEmoji: '📚'
  })
});
const { inviteCode } = await response.json();
// Display inviteCode for sharing
```

### Create Bet
```javascript
const response = await fetch('http://localhost:3001/api/bets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    groupId: 'circle-uuid',
    title: 'Who finishes first?',
    category: 'custom',
    createdBy: 'user-uuid',
    deadline: '2026-01-20T23:59:59Z',
    stake: 'Buy coffee for winner ☕',
    outcomes: [
      { label: 'Gloria', weight: 5 },
      { label: 'Sam', weight: 5 }
    ]
  })
});
const bet = await response.json();
```

### Join Bet
```javascript
const response = await fetch('http://localhost:3001/api/bets/{betId}/join', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-uuid',
    outcomeId: 'outcome-uuid',
    confidence: 8  // Slider value 1-10
  })
});
const entry = await response.json();
// Show: "You picked [outcome] with 8/10 confidence"
```

### Get Feed
```javascript
const response = await fetch('http://localhost:3001/api/feed/{userId}');
const feed = await response.json();
console.log(`${feed.betCount} active bets in your feed`);
feed.bets.forEach(bet => {
  console.log(`${bet.title} - Deadline: ${bet.deadline}`);
});
```

---

## Important Notes

### Confidence Slider
- Frontend: Show 1-10 slider
- Backend: Converts to 10-100% internally
- When displaying back: Divide by 10 to show as 1-10

### Deadline Auto-Locking
- When user tries to join after deadline
- Backend automatically locks the bet
- Returns error: "Cannot join bet. Bet status is 'locked'. The deadline has passed."

### Invite Codes
- 6 characters, alphanumeric
- Automatically generated
- Case-insensitive when joining
- Copy-to-clipboard button recommended

### Error Handling
- Check `response.status` before parsing JSON
- All errors have `.error` field with message
- Some errors include context (deadline, currentTime, etc.)

---

## Frontend File Structure (Suggested)

```
my-react-router-app/app/
├── pages/
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Home.tsx (Feed)
│   ├── CreateCircle.tsx
│   ├── CreateBet.tsx
│   ├── BetDetail.tsx
│   ├── Friends.tsx
│   └── Profile.tsx
├── components/
│   ├── BetCard.tsx
│   ├── CircleCard.tsx
│   ├── FriendCard.tsx
│   ├── ConfidenceSlider.tsx
│   └── InviteCodeDisplay.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useFeed.ts
│   ├── useBet.ts
│   └── useCircle.ts
└── utils/
    ├── api.ts
    └── localStorage.ts
```

---

## Testing the API with cURL

### Sign Up
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Pass123!","name":"Test","emoji":"🚀"}'
```

### Create Circle
```bash
curl -X POST http://localhost:3001/api/circles \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","creatorName":"Test","creatorEmoji":"🚀"}'
```

### Get Feed
```bash
curl http://localhost:3001/api/feed/{userId}
```

---

## Status Codes to Handle

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created |
| 400 | Bad Request | Check validation error |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate (username, entry) |
| 500 | Server Error | Retry later |

---

## Helpful Tips

1. **Store userId locally after login**
   ```javascript
   localStorage.setItem('userId', user.id);
   const userId = localStorage.getItem('userId');
   ```

2. **Format deadlines as ISO strings**
   ```javascript
   const deadline = new Date(Date.now() + 24*60*60*1000).toISOString();
   ```

3. **Display confidence with emoji**
   ```javascript
   const bars = '█'.repeat(confidence) + '░'.repeat(10 - confidence);
   console.log(`Confidence: ${bars} ${confidence}/10`);
   ```

4. **Show deadline countdown**
   ```javascript
   const deadline = new Date(bet.deadline);
   const hoursLeft = (deadline - new Date()) / (1000 * 60 * 60);
   ```

5. **Copy invite code to clipboard**
   ```javascript
   navigator.clipboard.writeText(inviteCode);
   ```

---

## What's Ready on Backend

✅ 17 endpoints fully implemented
✅ Database models and relationships
✅ Authentication with bcrypt
✅ Auto-locking bets
✅ Weighted random selection (for resolve)
✅ Friend following system
✅ Personalized feed
✅ Full error handling
✅ Input validation

---

## Start Building! 🚀

Backend is ready. Pick an endpoint above and start integrating!

For detailed information: See documentation files in `/backend` folder
