# Group Logic Implementation ✅

## Overview

Successfully implemented three core group endpoints that enable users to create groups, join them with invite codes, and view group members.

---

## API Endpoints

### 1. Create a Group
**Endpoint:** `POST /api/groups`

**Request:**
```json
{
  "name": "House 511",
  "creatorName": "Owner",
  "creatorEmoji": "🏠"
}
```

**Response:** `201 Created`
```json
{
  "message": "Group \"House 511\" created! Share invite code: IGYZEC",
  "inviteCode": "IGYZEC",
  "group": {
    "id": "uuid",
    "name": "House 511",
    "inviteCode": "IGYZEC",
    "createdBy": "uuid",
    "createdAt": "2026-01-17T18:57:54.703Z",
    "updatedAt": "2026-01-17T18:57:54.703Z",
    "creator": {
      "id": "uuid",
      "name": "Owner",
      "emoji": "🏠",
      "wins": 0,
      "losses": 0,
      "streak": 0
    }
  }
}
```

**Features:**
- ✅ Creates a new group with a unique name
- ✅ **Automatically generates a unique 6-character invite code** (e.g., "IGYZEC")
- ✅ Creates the group creator as a User if they don't exist
- ✅ Automatically adds the creator to the group membership
- ✅ Returns the invite code for sharing

---

### 2. Join a Group
**Endpoint:** `POST /api/groups/join`

**Request:**
```json
{
  "name": "Alice",
  "emoji": "👩",
  "inviteCode": "IGYZEC"
}
```

**Response:** `201 Created`
```json
{
  "message": "Welcome Alice! Successfully joined group: House 511",
  "user": {
    "id": "uuid",
    "name": "Alice",
    "emoji": "👩",
    "wins": 0,
    "losses": 0,
    "streak": 0,
    "createdAt": "2026-01-17T18:57:54.841Z",
    "updatedAt": "2026-01-17T18:57:54.841Z"
  },
  "group": {
    "id": "uuid",
    "name": "House 511",
    "inviteCode": "IGYZEC",
    "createdBy": "uuid",
    "createdAt": "2026-01-17T18:57:54.703Z",
    "updatedAt": "2026-01-17T18:57:54.703Z"
  }
}
```

**Features:**
- ✅ Accepts user name, emoji, and invite code
- ✅ Validates that the invite code exists
- ✅ **Creates a new user with name and emoji**
- ✅ **Automatically adds the user to the group**
- ✅ Returns both user and group information
- ✅ Personalized welcome message

---

### 3. Get Group Members
**Endpoint:** `GET /api/groups/:groupId`

**Response:** `200 OK`
```json
{
  "id": "342ab5ee-d16e-463b-a21b-cf556b5121d7",
  "name": "House 511",
  "inviteCode": "IGYZEC",
  "description": null,
  "createdBy": "bc35e478-98bd-47bf-b89e-132a38507b66",
  "createdAt": "2026-01-17T18:57:54.703Z",
  "updatedAt": "2026-01-17T18:57:54.703Z",
  "members": [
    {
      "id": "uuid",
      "name": "Owner",
      "emoji": "🏠",
      "wins": 0,
      "losses": 0,
      "streak": 0,
      "createdAt": "2026-01-17T18:57:54.699Z",
      "updatedAt": "2026-01-17T18:57:54.699Z"
    },
    {
      "id": "uuid",
      "name": "Alice",
      "emoji": "👩",
      "wins": 0,
      "losses": 0,
      "streak": 0,
      "createdAt": "2026-01-17T18:57:54.841Z",
      "updatedAt": "2026-01-17T18:57:54.841Z"
    },
    {
      "id": "uuid",
      "name": "Bob",
      "emoji": "👨",
      "wins": 0,
      "losses": 0,
      "streak": 0,
      "createdAt": "2026-01-17T18:57:54.911Z",
      "updatedAt": "2026-01-17T18:57:54.911Z"
    }
  ]
}
```

**Features:**
- ✅ Returns complete group information
- ✅ **Lists all members with their details (name, emoji, stats)**
- ✅ Shows member creation timestamps
- ✅ Includes each member's win/loss/streak stats

---

## Database Operations

### Tables Involved

**1. Groups Table**
```
id (UUID, PK)
name (String)
inviteCode (String, Unique)
createdBy (UUID, FK → Users)
description (String, nullable)
createdAt (DateTime)
updatedAt (DateTime)
```

**2. Users Table**
```
id (UUID, PK)
name (String)
emoji (String)
wins (Integer)
losses (Integer)
streak (Integer)
createdAt (DateTime)
updatedAt (DateTime)
```

**3. GroupMembers Table (Junction)**
```
userId (UUID, FK → Users)
groupId (UUID, FK → Groups)
createdAt (DateTime)
updatedAt (DateTime)
```

### Relationships
```
Group
  ├─ has many GroupMembers
  └─ has many Users (through GroupMembers)

User
  ├─ has many GroupMembers
  ├─ has many Groups (through GroupMembers)
  └─ can create many Groups

GroupMember
  ├─ belongs to User
  └─ belongs to Group
```

---

## Test Results

### Scenario: Create House 511 and Add Members

**Step 1: Create Group**
```bash
curl -X POST http://localhost:3001/api/groups \
  -H "Content-Type: application/json" \
  -d '{
    "name":"House 511",
    "creatorName":"Owner",
    "creatorEmoji":"🏠"
  }'
```

**Result:** ✅ Group created with invite code `IGYZEC`

**Step 2: Alice Joins**
```bash
curl -X POST http://localhost:3001/api/groups/join \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Alice",
    "emoji":"👩",
    "inviteCode":"IGYZEC"
  }'
```

**Result:** ✅ Alice created and added to House 511

**Step 3: Bob Joins**
```bash
curl -X POST http://localhost:3001/api/groups/join \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Bob",
    "emoji":"👨",
    "inviteCode":"IGYZEC"
  }'
```

**Result:** ✅ Bob created and added to House 511

**Step 4: Get Group Members**
```bash
curl http://localhost:3001/api/groups/342ab5ee-d16e-463b-a21b-cf556b5121d7
```

**Result:** ✅ Returns all 3 members:
- Owner 🏠
- Alice 👩
- Bob 👨

---

## Key Features Implemented

### ✅ Create Group with Unique Invite Codes
- Generates 6-character alphanumeric codes (e.g., "IGYZEC", "18TBY5")
- Each code is unique and case-insensitive
- Creator automatically becomes a member

### ✅ Join with Invite Code
- Users provide their name and emoji
- Validates invite code exists
- Creates new user record automatically
- Adds user to group membership
- Returns personalized welcome message

### ✅ View Group Members
- Lists all members in a group
- Shows each member's profile (name, emoji)
- Includes member statistics (wins, losses, streak)
- Sorted by join order (creator first)

---

## Error Handling

### Missing Fields
```json
// Request missing name
POST /api/groups/join
{"emoji":"👩","inviteCode":"IGYZEC"}

// Response
{
  "error": "name, emoji, and inviteCode are required",
  "status": 400
}
```

### Invalid Invite Code
```json
// Request with wrong code
POST /api/groups/join
{"name":"Alice","emoji":"👩","inviteCode":"WRONG"}

// Response
{
  "error": "Invalid invite code",
  "status": 404
}
```

---

## Code Example: Complete Workflow

```bash
#!/bin/bash

# 1. Create a group
CREATE=$(curl -s -X POST http://localhost:3001/api/groups \
  -H "Content-Type: application/json" \
  -d '{
    "name":"House 511",
    "creatorName":"Owner",
    "creatorEmoji":"🏠"
  }')

INVITE_CODE=$(echo $CREATE | jq -r '.inviteCode')
GROUP_ID=$(echo $CREATE | jq -r '.group.id')

echo "Created group: $GROUP_ID"
echo "Invite code: $INVITE_CODE"

# 2. Multiple users join with the code
for name in Alice Bob Charlie; do
  curl -s -X POST http://localhost:3001/api/groups/join \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$name\",\"emoji\":\"👤\",\"inviteCode\":\"$INVITE_CODE\"}"
done

# 3. View all members
curl -s http://localhost:3001/api/groups/$GROUP_ID | jq '.members'
```

---

## Database Verification

### Query to verify members of a group
```sql
SELECT u.name, u.emoji, u.wins, u.losses, u.streak
FROM Users u
JOIN GroupMembers gm ON u.id = gm.userId
JOIN Groups g ON g.id = gm.groupId
WHERE g.id = 'YOUR_GROUP_ID'
ORDER BY gm.createdAt;
```

---

## Next Steps

The Group logic is complete! Next, you can:

1. **Implement Bet Creation** - Let groups create bets/predictions
2. **Implement Bet Joining** - Let group members make picks
3. **Implement Bet Resolution** - Track winners and update stats
4. **Add Consequence Tracking** - Log when users complete consequences
5. **Build Frontend** - Create UI for group management

---

## Summary

✅ **Create Group** - Generate unique 6-char invite codes
✅ **Join Group** - Users join with name, emoji, and invite code
✅ **List Members** - View all group members with their stats

All three endpoints are fully functional and tested!
