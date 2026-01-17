# STAKE App - Complete API Reference

Full list of all endpoints for the backend API.

---

## Authentication

### Sign Up
- **POST** `/api/auth/signup`
- Create new account with username/password
- Body: `{ username, password, name, emoji }`

### Login
- **POST** `/api/auth/login`
- Authenticate with credentials
- Body: `{ username, password }`

---

## Users

### Get User
- **GET** `/api/users/:id`
- Retrieve user profile

### Create User (Legacy)
- **POST** `/api/users`
- Body: `{ name, emoji }`

### Update User
- **PUT** `/api/users/:id`
- Body: `{ name, emoji, wins, losses, streak }`

---

## Circles (Groups)

### Create Circle
- **POST** `/api/circles` or `/api/groups`
- Generates 6-char invite code
- Body: `{ name, creatorName, creatorEmoji }`

### Join Circle
- **POST** `/api/groups/join`
- Body: `{ name, emoji, inviteCode }`

### Get Circle
- **GET** `/api/groups/:groupId`
- Returns circle with members

### Get Circle Bets
- **GET** `/api/groups/:groupId/bets`
- All bets in the circle

---

## Bets

### Create Bet
- **POST** `/api/bets`
- Host creates bet with outcomes, stake, deadline
- Body: `{ groupId, title, category, createdBy, deadline, stake, outcomes: [{ label, weight }] }`

### Join Bet
- **POST** `/api/bets/:betId/join`
- User picks side, sets confidence (1-10)
- Body: `{ userId, outcomeId, confidence }`

### Resolve Bet
- **PUT** `/api/bets/:betId/resolve`
- Set winning outcome
- Body: `{ winningOutcomeId, resolvedBy }`

### Get Bet
- **GET** `/api/bets/:betId`
- Bet details with outcomes and entries

---

## Feed

### Get Personalized Feed
- **GET** `/api/feed/:userId`
- All active bets from circles + followed users
- Sorted by deadline (soonest first)

---

## Friends & Social

### Add Friend (Follow)
- **POST** `/api/friends/add`
- Start following a user
- Body: `{ userId, friendId }`

### Accept Friend (Mutual)
- **POST** `/api/friends/accept`
- Convert following → mutual
- Body: `{ userId, friendId }`

### Get Friends List
- **GET** `/api/friends/list/:userId`
- Returns: following, followers, mutual

### Delete Friendship
- **DELETE** `/api/friends/:friendshipId`

---

## Database Models

### User
```
id (UUID)
username (unique)
password (bcrypt hashed)
name
emoji
wins
losses
streak
createdAt, updatedAt
```

### Group (Circle)
```
id (UUID)
name
inviteCode (6-char, unique)
description
createdBy (userId)
createdAt, updatedAt
```

### Friendship
```
id (UUID)
userId
friendId
status (following | mutual)
createdAt
```

### Bet
```
id (UUID)
groupId
title
description
category
status (open | locked | resolved | completed)
createdBy
deadline
stake
winningOutcomeId
resolvedAt
resolvedBy
createdAt, updatedAt
```

### Outcome
```
id (UUID)
betId
label
weight
createdAt, updatedAt
```

### Entry (User's bet entry)
```
id (UUID)
betId
userId
outcomeId
confidence (1-10)
result (pending | win | loss)
completedAt
proofUrl
createdAt, updatedAt
```

---

## Status Codes

- **200** - OK
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (login failed)
- **404** - Not Found
- **409** - Conflict (duplicate username, etc.)
- **500** - Server Error

---

## Error Response Format

```json
{
  "error": "Error message",
  "status": 400
}
```

---

## Base URL
- Development: `http://localhost:3001`
- All routes prefixed with `/api`

---

## Key Features

### ✅ Authentication
- Username/password with bcrypt hashing
- Unique username enforcement
- Password never returned in responses

### ✅ Circles (Groups)
- 6-character alphanumeric invite codes
- Automatic invite code generation
- Join via code

### ✅ Bets
- Multiple outcomes per bet
- Weighted outcomes for random selection
- Deadline-based auto-locking
- Confidence slider (1-10)

### ✅ Feed
- Personalized for each user
- Combines circle bets + followed user bets
- Removes duplicates
- Sorted by deadline

### ✅ Social
- Follow/Mutual friend system
- BeReal-style identity (username + emoji)
- Friend suggestions in feed

---

## Next Steps

1. **Frontend Integration**
   - Connect auth routes (login/signup)
   - Fetch feed in Home page
   - Circle joining interface

2. **Bet Resolution**
   - Implement weighted random selection
   - Mark winners/losers
   - Assign consequences

3. **Proof System**
   - Upload proof of completed consequence
   - Image verification

4. **Notifications**
   - Bet created in your circles
   - Bet deadline approaching
   - You won/lost a bet
