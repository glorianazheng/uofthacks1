# Bet → Consequence: Social Betting App

A full-stack application where friends make predictions and face fun consequences. Built with React Router (frontend) and Node.js/Express (backend).

## 🚀 Quick Start

### Option 1: Start Both Servers (Recommended)
```bash
# Make the script executable (first time only)
chmod +x start.sh

# Run both servers
./start.sh
```

### Option 2: Start Servers Separately

**Backend Setup (Terminal 1):**
```bash
cd backend
npm install  # Only needed first time
npm start
# or: node server.js
```
Server runs at `http://localhost:3001`

**Frontend Setup (Terminal 2):**
```bash
cd my-react-router-app
npm install  # Only needed first time
npm run dev
```
Frontend runs at `http://localhost:5173`

### Troubleshooting

**Port already in use?**
- Backend: Change `PORT` in `backend/server.js` or set `PORT=3002 npm start`
- Frontend: React Router will automatically use the next available port

**Permission denied?**
- Make sure you have Node.js installed: `node --version`
- Try running with `npm start` instead of `node server.js`

**Can't connect to localhost?**
- Make sure both servers are running
- Check that the backend is running on port 3001
- Check browser console for CORS errors

---

## ✅ Currently Implemented

### Group Logic ✨
- ✅ **Create Groups** - Generate unique 6-character invite codes
- ✅ **Join Groups** - Users provide name, emoji, and invite code
- ✅ **List Members** - View everyone in a group with their stats

**See:** `GROUP_LOGIC.md` for complete Group API documentation

### Betting Logic 🎰
- ✅ **Create Bets** - Host creates bets with multiple outcomes and a deadline
- ✅ **Join Bets** - Members pick a side and set confidence (1-10 slider)
- ✅ **Deadline Locking** - Bets auto-lock when deadline passes
- ✅ **Bet Resolution** - Host declares the winning outcome
- ✅ **Weighted Roulette** - ONE loser picked based on confidence probability
- ✅ **Chore Assignment** - Chosen loser owes the stake
- ✅ **Stats Tracking** - User wins/losses/streak updated automatically

**See:** `BETTING_RESOLUTION.md` for complete Betting Resolution API documentation

### Backend Structure
- ✅ Express server with middleware
- ✅ Sequelize ORM with SQLite database
- ✅ User model with stats tracking (wins/losses/streak)
- ✅ Group and GroupMember models
- ✅ Bet and Outcome models
- ✅ Entry model for user bet picks
- ✅ Error handling and validation
- ✅ CORS enabled for frontend

### Frontend Structure
- ✅ React Router v7 setup
- ✅ TypeScript support
- ✅ Tailwind CSS styling
- ✅ Phone mockup UI with responsive design

---

## 📚 Documentation

- **GROUP_LOGIC.md** - Group API endpoints with examples
- **INTEGRATION.md** - Frontend-backend integration guide
- **API.md** - Complete API reference
- **ARCHITECTURE.md** - Database schema and design

---

## 🎯 Next Steps

1. Implement Bet Creation endpoints
2. Implement Bet Joining/Entry endpoints
3. Implement Bet Resolution and stats updates
4. Build frontend pages and integrate with API

---

## 🛠️ Tech Stack

**Frontend:** React Router 7 | TypeScript | Tailwind CSS | Vite
**Backend:** Node.js | Express 4.18 | Sequelize ORM | SQLite
**Database:** SQLite with proper relationships and constraints

---

## 📁 Project Structure

```
uofthacks1/
├── backend/
│   ├── server.js              # Express app
│   ├── database.js            # Sequelize models
│   ├── routes/api.js          # API endpoints
│   └── package.json           # Dependencies
├── my-react-router-app/       # React frontend
├── GROUP_LOGIC.md             # Group endpoints documentation
└── README.md                  # This file
```

---

## 🧪 Testing

To test the Group endpoints:

```bash
# Create a group
curl -X POST http://localhost:3001/api/groups \
  -H "Content-Type: application/json" \
  -d '{"name":"House 511","creatorName":"Owner","creatorEmoji":"🏠"}'

# Join the group
curl -X POST http://localhost:3001/api/groups/join \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","emoji":"👩","inviteCode":"IGYZEC"}'

# Get members
curl http://localhost:3001/api/groups/GROUP_ID
```

See `GROUP_LOGIC.md` for more examples and detailed responses.