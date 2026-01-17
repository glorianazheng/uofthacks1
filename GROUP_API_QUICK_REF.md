# Group API Quick Reference

## Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/groups` | Create a new group |
| `POST` | `/api/groups/join` | Join a group with invite code |
| `GET` | `/api/groups/:groupId` | Get group details and members |

---

## 1. Create Group

```bash
POST /api/groups
Content-Type: application/json

{
  "name": "House 511",
  "creatorName": "Owner",
  "creatorEmoji": "🏠"
}
```

**Success (201):**
```json
{
  "message": "Group \"House 511\" created! Share invite code: IGYZEC",
  "inviteCode": "IGYZEC",
  "group": {
    "id": "uuid",
    "name": "House 511",
    "inviteCode": "IGYZEC",
    "createdBy": "uuid"
  },
  "creator": {
    "id": "uuid",
    "name": "Owner",
    "emoji": "🏠"
  }
}
```

---

## 2. Join Group

```bash
POST /api/groups/join
Content-Type: application/json

{
  "name": "Alice",
  "emoji": "👩",
  "inviteCode": "IGYZEC"
}
```

**Success (201):**
```json
{
  "message": "Welcome Alice! Successfully joined group: House 511",
  "user": {
    "id": "uuid",
    "name": "Alice",
    "emoji": "👩",
    "wins": 0,
    "losses": 0,
    "streak": 0
  },
  "group": {
    "id": "uuid",
    "name": "House 511",
    "inviteCode": "IGYZEC"
  }
}
```

**Error (400):**
```json
{
  "error": "name, emoji, and inviteCode are required",
  "status": 400
}
```

**Error (404):**
```json
{
  "error": "Invalid invite code",
  "status": 404
}
```

---

## 3. Get Group Members

```bash
GET /api/groups/342ab5ee-d16e-463b-a21b-cf556b5121d7
```

**Success (200):**
```json
{
  "id": "342ab5ee-d16e-463b-a21b-cf556b5121d7",
  "name": "House 511",
  "inviteCode": "IGYZEC",
  "createdBy": "bc35e478-98bd-47bf-b89e-132a38507b66",
  "members": [
    {
      "id": "uuid",
      "name": "Owner",
      "emoji": "🏠",
      "wins": 0,
      "losses": 0,
      "streak": 0
    },
    {
      "id": "uuid",
      "name": "Alice",
      "emoji": "👩",
      "wins": 0,
      "losses": 0,
      "streak": 0
    },
    {
      "id": "uuid",
      "name": "Bob",
      "emoji": "👨",
      "wins": 0,
      "losses": 0,
      "streak": 0
    }
  ]
}
```

---

## Complete Workflow Example

```bash
#!/bin/bash

# 1. Create group
RESPONSE=$(curl -s -X POST http://localhost:3001/api/groups \
  -H "Content-Type: application/json" \
  -d '{"name":"House 511","creatorName":"Owner","creatorEmoji":"🏠"}')

INVITE_CODE=$(echo $RESPONSE | jq -r '.inviteCode')
GROUP_ID=$(echo $RESPONSE | jq -r '.group.id')

echo "Group created: $GROUP_ID"
echo "Share invite code: $INVITE_CODE"

# 2. Alice joins
curl -s -X POST http://localhost:3001/api/groups/join \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice\",\"emoji\":\"👩\",\"inviteCode\":\"$INVITE_CODE\"}"

# 3. Bob joins
curl -s -X POST http://localhost:3001/api/groups/join \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Bob\",\"emoji\":\"👨\",\"inviteCode\":\"$INVITE_CODE\"}"

# 4. View all members
curl -s http://localhost:3001/api/groups/$GROUP_ID | jq '.members'
```

---

## Key Features

✅ **Unique Invite Codes** - 6-character alphanumeric codes (e.g., "IGYZEC")
✅ **Auto User Creation** - Users created automatically when joining
✅ **Auto Membership** - Users automatically added to group
✅ **User Stats** - Each member tracks wins, losses, and streak
✅ **Error Handling** - Clear error messages for validation failures

---

## Status Codes

| Code | Meaning |
|------|---------|
| 201 | Created successfully |
| 200 | Request successful |
| 400 | Bad request (missing fields) |
| 404 | Not found (invalid invite code) |
| 500 | Server error |

---

## Tips

1. **Save the invite code** after creating a group to share with friends
2. **Case-insensitive codes** - "IGYZEC" = "igyzec"
3. **One user can join multiple groups** with different invite codes
4. **Get Group Members** to see real-time list of who's playing
5. **User stats** (wins/losses) update when bets are resolved

---

## Testing with cURL

### Create & Join in One Command

```bash
# Create
CODE=$(curl -s -X POST http://localhost:3001/api/groups \
  -d '{"name":"Test","creatorName":"Admin","creatorEmoji":"👤"}' \
  -H "Content-Type: application/json" | jq -r '.inviteCode')

# Join
curl -X POST http://localhost:3001/api/groups/join \
  -d "{\"name\":\"Alice\",\"emoji\":\"👩\",\"inviteCode\":\"$CODE\"}" \
  -H "Content-Type: application/json"
```

