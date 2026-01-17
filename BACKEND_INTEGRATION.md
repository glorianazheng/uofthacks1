# 🔌 Backend Integration Guide

This document shows how to add a real backend to your app. Everything is currently mocked with `console.log` and `alert()`.

## Choose Your Backend

| Option | Best For | Ease | Cost |
|--------|----------|------|------|
| **Firebase** | Rapid prototyping, realtime | Easy | Free tier generous |
| **Supabase** | PostgreSQL alternative | Medium | Free tier good |
| **Custom Node.js** | Full control | Hard | Pay-per-use |

**Recommendation for Hackathon**: **Firebase** (fastest to integrate)

## Firebase Integration (Step-by-Step)

### 1. Setup Firebase Project

```bash
# Install Firebase
npm install firebase

# Create src/lib/firebase.ts
```

```typescript
// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 2. Add Authentication

```typescript
// In join-group.tsx, replace the alert with:
import { auth } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

const handleNameSubmit = async () => {
  if (name.trim()) {
    try {
      // Create anonymous auth or email auth
      await auth.signInAnonymously();
      // Store user profile in Firestore
      await db.collection("users").doc(auth.currentUser.uid).set({
        name,
        emoji: selectedEmoji,
        createdAt: new Date(),
      });
      setStep("code");
    } catch (error) {
      setError("Failed to create account: " + error.message);
    }
  }
};
```

### 3. Create Database Schema

Create these collections in Firestore:

```javascript
// Collection: groups
{
  id: "house-511",
  name: "House 511",
  createdBy: "user-123",
  members: ["user-123", "user-456"],
  inviteCode: "ABC123",
  createdAt: Timestamp,
}

// Collection: bets
{
  id: "bet-001",
  groupId: "house-511",
  hostId: "user-123",
  title: "Raptors vs Lakers",
  eventType: "sports",
  description: "NBA game on Jan 20",
  outcomes: [
    { id: "outcome-0", label: "Raptors win" },
    { id: "outcome-1", label: "Lakers win" }
  ],
  stake: {
    type: "lunch",
    description: "Buy lunch for the group"
  },
  deadline: Timestamp,
  status: "open|locked|resolved|completed",
  createdAt: Timestamp,
}

// Collection: picks
{
  id: "pick-001",
  betId: "bet-001",
  userId: "user-123",
  outcomeId: "outcome-0",
  confidence: 75,
  createdAt: Timestamp,
}

// Collection: users
{
  id: "user-123",
  name: "Jay",
  emoji: "😎",
  createdAt: Timestamp,
}
```

### 4. Replace Mock Data in create-bet.tsx

```typescript
// Current code (line ~150):
button
  onClick={() => {
    console.log("Creating bet:", betData);
    alert("Bet created! (feature coming soon)");
  }}

// Replace with:
button
  onClick={async () => {
    try {
      const docRef = await db.collection("bets").add({
        groupId: currentGroupId,
        hostId: auth.currentUser.uid,
        title: betData.eventTitle,
        eventType: betData.eventType,
        description: betData.eventDescription,
        outcomes: betData.outcomes,
        stake: betData.stake,
        deadline: Timestamp.fromDate(betData.deadline),
        status: "open",
        createdAt: Timestamp.now(),
      });
      
      navigate(`/bet/${docRef.id}`);
    } catch (error) {
      alert("Failed to create bet: " + error.message);
    }
  }}
```

### 5. Load Real Data in join-group.tsx

```typescript
// Current code:
const handleCodeSubmit = () => {
  if (code.length === 6) {
    alert("Joining group... (feature coming soon)");
  }
};

// Replace with:
const handleCodeSubmit = async () => {
  if (code.length === 6) {
    try {
      const querySnapshot = await db
        .collection("groups")
        .where("inviteCode", "==", code)
        .limit(1)
        .get();
      
      if (querySnapshot.empty) {
        setError("Invalid code");
        return;
      }
      
      const group = querySnapshot.docs[0];
      
      // Add current user to group
      await db.collection("groups").doc(group.id).update({
        members: arrayUnion(auth.currentUser.uid),
      });
      
      // Store user data
      await db.collection("users").doc(auth.currentUser.uid).set({
        name,
        emoji: selectedEmoji,
        createdAt: new Date(),
      });
      
      navigate(`/group/${group.id}`);
    } catch (error) {
      setError("Failed to join: " + error.message);
    }
  }
};
```

### 6. Load Real Data in dashboard.tsx

```typescript
import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user's groups
        const groupsSnapshot = await db
          .collection("groups")
          .where("members", "array-contains", auth.currentUser.uid)
          .get();
        
        setGroups(
          groupsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );

        // Load user's active bets
        const betsSnapshot = await db
          .collection("bets")
          .where("status", "in", ["open", "locked"])
          .get();
        
        setBets(
          betsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;

  // ... rest of component, but use real data
}
```

### 7. Real-Time Updates with Listeners

For live bet counts (when someone joins):

```typescript
// In bet.tsx
useEffect(() => {
  const unsubscribe = db
    .collection("picks")
    .where("betId", "==", id)
    .onSnapshot((snapshot) => {
      const picks = {};
      snapshot.docs.forEach((doc) => {
        const { outcomeId } = doc.data();
        picks[outcomeId] = (picks[outcomeId] || 0) + 1;
      });
      setOutcomePicks(picks);
    });

  return unsubscribe;
}, [id]);
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Anyone can read groups they're a member of
    match /groups/{groupId} {
      allow read: if request.auth.uid in resource.data.members;
      allow write: if request.auth.uid == resource.data.createdBy;
    }

    // Anyone can read bets, only host can resolve
    match /bets/{betId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.hostId;
    }

    // Users can manage their own picks
    match /picks/{pickId} {
      allow read: if true;
      allow create, delete: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Supabase Alternative

```typescript
// If using Supabase instead of Firebase:
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://your-project.supabase.co",
  "your-anon-key"
);

// Then use supabase instead of db:
const { data, error } = await supabase
  .from("bets")
  .select("*")
  .eq("status", "open");
```

## Authentication Options

### Option 1: Anonymous (Easiest)
```typescript
auth.signInAnonymously();
// No login screen needed
```

### Option 2: Email (Better)
```typescript
createUserWithEmailAndPassword(auth, email, password);
// Users create account with email
```

### Option 3: Google (Social)
```typescript
signInWithPopup(auth, new GoogleAuthProvider());
// Users sign in with Google account
```

## Testing Integration

```bash
# 1. Connect to Firebase console
# Go to: https://console.firebase.google.com

# 2. Create test data manually
# 2a. Create a group
# 2b. Create a bet
# 2c. Add some picks

# 3. Run app
npm run dev

# 4. Verify data loads
# - Dashboard should show real groups
# - Bet page should show real picks

# 5. Create a new bet
# - Should appear in Firestore
# - Should load on refresh
```

## Common Gotchas

### 1. CORS Issues
If you get CORS errors, make sure Firebase domain is allowed in settings.

### 2. Timestamp Format
Firestore uses Timestamps, not JS Dates:
```typescript
import { Timestamp } from "firebase/firestore";
const now = Timestamp.now();
const date = now.toDate(); // Convert to JS Date
```

### 3. Array Operations
Use special operators for array updates:
```typescript
import { arrayUnion } from "firebase/firestore";

await db.collection("groups").doc(id).update({
  members: arrayUnion(userId), // Add to array
});
```

### 4. Real-Time Listeners Memory Leaks
Always unsubscribe:
```typescript
useEffect(() => {
  const unsubscribe = db.collection("bets").onSnapshot(snapshot => {
    // ...
  });
  
  return unsubscribe; // Clean up on unmount
}, []);
```

## Deployment with Backend

```bash
# Build
npm run build

# Deploy to Vercel (recommended)
vercel deploy

# Or Netlify
netlify deploy --prod
```

Both will auto-build and deploy on git push.

---

**You're now ready to add a backend!** 🚀

Start with Firebase (easiest), then switch to your preferred stack as you grow.
