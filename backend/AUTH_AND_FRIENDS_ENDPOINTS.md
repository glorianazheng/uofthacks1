# Authentication & Friendship Endpoints

## Database Changes
- **User Model**: Added `username` (unique) and `password` (bcrypt hashed) fields
- **Friendship Model**: New model tracking user relationships with `status` (following/mutual)

---

## Authentication Routes

### POST `/api/auth/signup`
Create a new user account with username and password.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepass123",
  "name": "John Doe",
  "emoji": "🎮"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "username": "johndoe",
  "name": "John Doe",
  "emoji": "🎮",
  "wins": 0,
  "losses": 0,
  "streak": 0,
  "createdAt": "2026-01-17T...",
  "updatedAt": "2026-01-17T..."
}
```

**Validation:**
- Username: min 3 characters, must be unique
- Password: min 6 characters
- Name & Emoji: required

**Errors:**
- 400: Missing required fields or validation failed
- 409: Username already taken

---

### POST `/api/auth/login`
Login with username and password.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "username": "johndoe",
  "name": "John Doe",
  "emoji": "🎮",
  "wins": 0,
  "losses": 0,
  "streak": 0,
  "createdAt": "2026-01-17T...",
  "updatedAt": "2026-01-17T..."
}
```

**Errors:**
- 400: Missing username or password
- 401: Invalid username or password

---

## Friendship Routes

### POST `/api/friends/add`
Create a 'Following' relationship (one-way follow).

**Request Body:**
```json
{
  "userId": "user-uuid",
  "friendId": "friend-uuid"
}
```

**Response (201):**
```json
{
  "id": "friendship-uuid",
  "userId": "user-uuid",
  "friendId": "friend-uuid",
  "status": "following",
  "createdAt": "2026-01-17T..."
}
```

**Errors:**
- 400: Missing userId/friendId or trying to follow yourself
- 404: One or both users not found
- 409: Friendship already exists

---

### POST `/api/friends/accept`
Update relationship to 'Mutual' (both follow each other).

**Request Body:**
```json
{
  "userId": "user-uuid",
  "friendId": "friend-uuid"
}
```

**Logic:**
- Converts `friendId → userId` relationship from "following" to "mutual"
- Creates reverse `userId → friendId` relationship as "mutual" if it doesn't exist
- Updates existing reverse relationship to "mutual" if it already exists

**Response (200):**
```json
{
  "id": "friendship-uuid",
  "userId": "friend-uuid",
  "friendId": "user-uuid",
  "status": "mutual",
  "createdAt": "2026-01-17T..."
}
```

**Errors:**
- 400: Missing userId or friendId
- 404: Friendship request not found

---

### GET `/api/friends/list/:userId`
Return a list of mutual friends, following, and followers.

**Response (200):**
```json
{
  "userId": "user-uuid",
  "following": [
    {
      "id": "friendship-uuid",
      "user": {
        "id": "friend-uuid",
        "username": "janedoe",
        "name": "Jane Doe",
        "emoji": "🎨",
        "wins": 5,
        "losses": 2,
        "streak": 2
      },
      "status": "following",
      "createdAt": "2026-01-17T..."
    }
  ],
  "followers": [
    {
      "id": "friendship-uuid",
      "user": {
        "id": "follower-uuid",
        "username": "bobsmith",
        "name": "Bob Smith",
        "emoji": "⚽",
        "wins": 3,
        "losses": 1,
        "streak": -1
      },
      "status": "following",
      "createdAt": "2026-01-17T..."
    }
  ],
  "mutual": [
    {
      "id": "friendship-uuid",
      "user": {
        "id": "friend-uuid",
        "username": "janedoe",
        "name": "Jane Doe",
        "emoji": "🎨",
        "wins": 5,
        "losses": 2,
        "streak": 2
      },
      "status": "mutual",
      "createdAt": "2026-01-17T..."
    }
  ],
  "mutualCount": 1,
  "followingCount": 3,
  "followersCount": 2
}
```

**Errors:**
- 404: User not found

---

### DELETE `/api/friends/:id`
Delete a friendship relationship.

**Response (200):**
```json
{
  "message": "friendship deleted"
}
```

**Errors:**
- 404: Friendship not found

---

## Implementation Notes

### Password Security
- Passwords are hashed using bcrypt with salt rounds of 10
- Passwords are never returned in API responses
- Login compares the provided password against the stored hash

### Friendship Status Values
- **following**: User A follows User B, but User B doesn't follow User A back
- **mutual**: Both users follow each other

### Mutual Friends Logic
A friendship is considered "mutual" when:
1. User A follows User B (userId=A, friendId=B, status=mutual)
2. User B follows User A (userId=B, friendId=A, status=mutual)

The `/friends/list` endpoint returns only relationships where both directions have status="mutual" in the `mutual` array.

---

## Example Flow: Two Users Becoming Mutual Friends

1. **User A follows User B:**
   ```
   POST /api/friends/add
   { "userId": "A", "friendId": "B" }
   → Creates: A following B
   ```

2. **User B accepts the follow (follows back):**
   ```
   POST /api/friends/accept
   { "userId": "A", "friendId": "B" }
   → Updates: B → A to mutual
   → Creates: A → B as mutual
   ```

3. **Now both are mutual friends:**
   ```
   GET /api/friends/list/A
   → mutual array includes B
   
   GET /api/friends/list/B
   → mutual array includes A
   ```
