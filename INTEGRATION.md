# Frontend-Backend Integration Guide

## Overview

This guide explains how to connect the React Router frontend to the Node.js/Express backend.

## Current Status

### Frontend ✅
- Location: `my-react-router-app/`
- Status: Complete (6 pages, 4 components, responsive design)
- Running at: `http://localhost:5173`
- Pages: Home, Dashboard, Create Bet, Join Group, Group, Bet Details

### Backend ✅
- Location: `backend/`
- Status: Complete (7 routes with 14 endpoints, SQLite database)
- Running at: `http://localhost:3001`
- Database: Sequelize ORM with 6 models

---

## Starting Both Servers

### Terminal 1: Backend
```bash
cd backend
npm install        # First time only
node server.js
# Output: ✅ Server running on http://localhost:3001
```

### Terminal 2: Frontend
```bash
cd my-react-router-app
npm install        # First time only
npm run dev
# Output: Local: http://localhost:5173
```

---

## API Integration Pattern

### Current Frontend (Using Mock Data)

Pages currently show placeholder data or use `alert()`:
```typescript
// Example from create-bet.tsx
alert(`Created bet: "${title}"`);
```

### Integration Steps

#### 1. Define API Service

Create `my-react-router-app/src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  // Users
  createUser: (name: string, emoji: string) =>
    fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, emoji }),
    }).then(r => r.json()),

  getUser: (id: string) =>
    fetch(`${API_BASE_URL}/users/${id}`).then(r => r.json()),

  updateUser: (id: string, data: any) =>
    fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  // Groups
  createGroup: (name: string, createdBy: string) =>
    fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, createdBy }),
    }).then(r => r.json()),

  getGroup: (id: string) =>
    fetch(`${API_BASE_URL}/groups/${id}`).then(r => r.json()),

  joinGroup: (inviteCode: string, userId: string) =>
    fetch(`${API_BASE_URL}/groups/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode, userId }),
    }).then(r => r.json()),

  getGroupBets: (groupId: string) =>
    fetch(`${API_BASE_URL}/groups/${groupId}/bets`).then(r => r.json()),

  // Bets
  createBet: (data: any) =>
    fetch(`${API_BASE_URL}/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  getBet: (id: string) =>
    fetch(`${API_BASE_URL}/bets/${id}`).then(r => r.json()),

  updateBet: (id: string, data: any) =>
    fetch(`${API_BASE_URL}/bets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  // Entries
  createEntry: (data: any) =>
    fetch(`${API_BASE_URL}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  getEntries: (userId: string) =>
    fetch(`${API_BASE_URL}/entries/${userId}`).then(r => r.json()),

  updateEntry: (id: string, data: any) =>
    fetch(`${API_BASE_URL}/entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  completeEntry: (id: string, result: 'win' | 'loss') =>
    fetch(`${API_BASE_URL}/entries/${id}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result }),
    }).then(r => r.json()),
};
```

#### 2. Create User Context/Store

Create `my-react-router-app/src/context/AuthContext.tsx`:

```typescript
import { createContext, useContext, useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  setUser: (user: User) => void;
  createUser: (name: string, emoji: string) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const createUser = async (name: string, emoji: string) => {
    const newUser = await api.createUser(name, emoji);
    setUser(newUser);
    localStorage.setItem('userId', newUser.id);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, createUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};
```

#### 3. Update Home Page

Update `my-react-router-app/src/app/routes/home.tsx`:

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { createUser } = useAuth();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🤴');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const user = await createUser(name, emoji);
      navigate('/dashboard', { state: { userId: user.id } });
    } catch (error) {
      alert('Failed to create user');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... existing JSX ...
    <button onClick={handleStart} disabled={loading}>
      {loading ? 'Creating...' : 'Get Started'}
    </button>
  );
}
```

#### 4. Update Create Bet Page

Update `my-react-router-app/src/app/routes/create-bet.tsx`:

```typescript
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { api } from '../services/api';

export default function CreateBet() {
  const navigate = useNavigate();
  const location = useLocation();
  const groupId = location.state?.groupId;
  const userId = location.state?.userId;
  
  const [title, setTitle] = useState('');
  const [outcomes, setOutcomes] = useState([{ label: '', weight: 1 }]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !groupId) return;

    setLoading(true);
    try {
      const bet = await api.createBet({
        groupId,
        title,
        category: 'custom',
        createdBy: userId,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        stake: 'TBD',
        outcomes: outcomes.filter(o => o.label),
      });

      navigate('/group', { state: { groupId, userId } });
    } catch (error) {
      alert('Failed to create bet');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component ...
}
```

#### 5. Update Dashboard Page

Update `my-react-router-app/src/app/routes/dashboard.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { api } from '../services/api';
import { User, Group } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        const userData = await api.getUser(userId);
        setUser(userData);

        // Note: You may need to add a GET /api/users/:id/groups endpoint
        // Or store group IDs in localStorage
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div className="space-y-4">
      <h1>Welcome, {user.name} {user.emoji}</h1>
      <div>
        <p>Wins: {user.wins}</p>
        <p>Losses: {user.losses}</p>
        <p>Streak: {user.streak}</p>
      </div>
      
      <button onClick={() => navigate('/join-group', { state: { userId } })}>
        Join Group
      </button>
      
      <button onClick={() => navigate('/create-bet', { state: { userId } })}>
        Create Bet
      </button>
    </div>
  );
}
```

---

## Data Flow Diagram

```
Frontend                           Backend
=========                          =======

User Input
    ↓
React Component
    ↓
api.createUser() ─────→ POST /api/users
                              ↓
                        Sequelize creates User
                              ↓
                        SQLite saves User
                              ↓
                        JSON response ←───
    ↓
Store in context/state
    ↓
Update UI / Navigate
```

---

## Testing the Integration

### 1. Start both servers (see "Starting Both Servers" above)

### 2. Create a test user
```typescript
// In browser console
fetch('http://localhost:3001/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Test', emoji: '👤' })
}).then(r => r.json()).then(console.log)
```

### 3. Click through the app
- Home page → Create user
- Dashboard → View stats
- Create Bet → Create new bet
- Join Group → Join with code

### 4. Verify database
```bash
# Backend terminal
sqlite3 data/betting_app.db
> SELECT * FROM users;
> SELECT * FROM bets;
```

---

## Environment Configuration

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

Update `my-react-router-app/src/services/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

### Backend (.env)
```
PORT=3001
NODE_ENV=development
```

---

## Common Integration Issues

### Issue: CORS Error
```
Access to XMLHttpRequest at 'http://localhost:3001/api/users' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:** CORS is already enabled in `server.js`:
```javascript
app.use(cors());
```

If issue persists:
```bash
# Install cors package
npm install cors

# Restart backend server
node server.js
```

### Issue: User not persisting
```
User created successfully but disappears on page refresh
```

**Solution:** Store userId in localStorage:
```typescript
localStorage.setItem('userId', user.id);
const userId = localStorage.getItem('userId');
```

### Issue: "Failed to fetch"
```
Network error when calling API
```

**Solution:** Verify both servers running:
```bash
# Check frontend
curl http://localhost:5173

# Check backend
curl http://localhost:3001/api/health
```

---

## Migration Checklist

- [ ] Copy API service code to frontend
- [ ] Create AuthContext provider
- [ ] Update Home page to use createUser
- [ ] Update Dashboard to load user data
- [ ] Update Create Bet to call API
- [ ] Update Join Group to call API
- [ ] Update Group page to load bets
- [ ] Update Bet page to load entries
- [ ] Test all CRUD operations
- [ ] Test user persistence (localStorage)
- [ ] Test navigation between pages
- [ ] Fix any type errors
- [ ] Test on mobile view
- [ ] Performance optimization (loading states, error handling)

---

## Next Steps

1. **Implement API calls** in each page
2. **Add error handling** with user feedback
3. **Add loading states** for API requests
4. **Persist user session** with localStorage
5. **Add real-time updates** with WebSockets
6. **Deploy to production** (Heroku, Vercel, etc.)

---

## API Reference

For complete API documentation, see `backend/API.md`

Quick endpoints:
- Users: POST, GET, PUT
- Groups: POST, GET, JOIN
- Bets: POST, GET, PUT
- Entries: POST, GET, PUT, COMPLETE

---

## File Map

```
my-react-router-app/
├── src/
│   ├── app/
│   │   ├── root.tsx          ← Add AuthProvider here
│   │   ├── routes/
│   │   │   ├── home.tsx      ← Update: createUser()
│   │   │   ├── dashboard.tsx ← Update: getUser()
│   │   │   ├── create-bet.tsx ← Update: createBet()
│   │   │   ├── join-group.tsx ← Update: joinGroup()
│   │   │   ├── group.tsx     ← Update: getGroupBets()
│   │   │   └── bet.tsx       ← Update: getBet(), createEntry()
│   │   └── components/
│   ├── context/
│   │   └── AuthContext.tsx   ← NEW: Create this
│   ├── services/
│   │   └── api.ts            ← NEW: Create this
│   └── types/
│       └── index.ts          ← Existing type definitions

backend/
├── routes/api.js             ← Ready to use
├── server.js                 ← Ready to use
└── database.js               ← Ready to use
```

---

## Success Criteria

✅ Backend running on port 3001
✅ Frontend running on port 5173
✅ Can create users via API
✅ Can create groups and bets
✅ Can join groups and bets
✅ User stats update correctly
✅ Data persists in SQLite
✅ No CORS errors
✅ No TypeScript errors
✅ All pages functional

Good luck! 🎉
