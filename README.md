# 🎲 Bet → Consequence - Hackathon App

A mobile-first web app where friends make bets and pay up with chores instead of money.

## 👉 **[START HERE](START_HERE.md)** 👈

This is your entry point. It has quick start, what was built, and next steps.

## Quick Start

```bash
cd my-react-router-app
npm install
npm run dev
```

Visit `http://localhost:5173`

## What's Built

✅ **6 Pages** - Welcome, Dashboard, Create Bet, Join Group, Group Details, Bet Details
✅ **4 Components** - Event picker, outcome builder, stake selector, deadline picker
✅ **Full TypeScript** - All types defined and ready for backend
✅ **Mobile UI** - Beautiful phone mockup with notch, bezel, and responsive design
✅ **Interactive Wizards** - 5-step bet creation flow with validation
✅ **Scoreboard** - Track wins/losses/streaks for each group member

## Key Features

### User Flow
1. **Welcome** → Beautiful intro page with phone mockup
2. **Dashboard** → See your groups and active bets
3. **Create Bet** → 5-step wizard (event → outcomes → stake → deadline → review)
4. **Join Group** → Quick name + emoji signup with invite code
5. **Group Page** → Scoreboard of members and group bets
6. **Bet Details** → View outcomes, set confidence level, join bet

### Bet Features
- 4 event types: Sports 🏀, TV/Entertainment 📺, Weather 🌧️, Custom 🎲
- 2+ configurable outcomes (e.g., "Team A wins" / "Team B wins")
- 7 built-in consequence templates: dishes, trash, vacuum, lunch, boba, drive, cook
- Custom stakes also supported
- Deadline picker to lock betting at game time/episode air time
- Confidence slider (1-100%) for weighted odds

### Social Features
- Create groups with custom names
- Invite friends with 6-character codes
- No long signup - just name + emoji
- Live scoreboard showing wins/losses/streaks for each member

## Project Structure

```
my-react-router-app/
├── app/
│   ├── routes/
│   │   ├── home.tsx              # Welcome page
│   │   ├── dashboard.tsx         # Main hub
│   │   ├── create-bet.tsx        # Bet creation wizard
│   │   ├── join-group.tsx        # Group signup
│   │   ├── group.tsx             # Group + scoreboard
│   │   └── bet.tsx               # Bet details
│   ├── components/
│   │   ├── EventTypePicker.tsx
│   │   ├── OutcomeBuilder.tsx
│   │   ├── StakeSelector.tsx
│   │   └── DeadlinePicker.tsx
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   └── app.css
└── package.json
```

## Next Steps

1. **Choose Backend** - Firebase, Supabase, or custom Node.js
2. **Add Authentication** - User login/signup
3. **Connect Database** - Store groups, bets, picks
4. **Implement Resolution** - Mark winners, track consequences
5. **Deploy** - Vercel, Netlify, or your host

## Documentation

- **[BETTING_APP_README.md](./BETTING_APP_README.md)** - Technical deep dive
- **[APP_FLOW_GUIDE.md](./APP_FLOW_GUIDE.md)** - User journey and integration guide
- **[BUILD_SUMMARY.md](./BUILD_SUMMARY.md)** - What was built and what's next

## Tech Stack

- React Router v7 (framework)
- TypeScript (type safety)
- Tailwind CSS (mobile-first styling)
- Vite (bundler)

## Status

🚀 **Frontend: Complete & Production-Ready**

The UI is fully functional. Just add a backend database to store real data and you're ready to launch!

---

**Built for hackathons. Ship it! 🚀**
