# 🎲 Bet → Consequence - App Flow Guide

## User Journey

### 1. **Welcome Page** (http://localhost:5173)
- Shows beautiful phone UI mockup
- "Get Started" button links to dashboard
- Explains how the app works (create bet → pick sides → pay chore)

### 2. **Dashboard** (/dashboard)
- View all your groups
- See active bets
- Quick action buttons: "New Bet" and "Join Group"

### 3. **Create a Bet** (/create-bet)
**Step-by-step wizard:**
- **Step 1**: Pick event type (Sports, TV, Weather, Custom)
- **Step 2**: Describe the event (e.g., "Raptors vs Lakers Jan 20")
- **Step 3**: Define outcomes (e.g., "Raptors win" / "Lakers win")
- **Step 4**: Choose stake/consequence (dishes, trash, vacuum, etc.)
- **Step 5**: Set deadline (when betting locks)
- **Review**: Confirm all details and create bet

### 4. **Join Group** (/join-group)
- Enter your name + emoji
- Get 6-character invite code from group host
- Instant access to group's bets

### 5. **Group Page** (/group/:id)
- Scoreboard of all members (wins/losses/streaks)
- List of all bets in the group
- Quick action: "New Bet" or view "Invite Code"

### 6. **Bet Details** (/bet/:id)
- See all outcomes and how many people picked each
- Visual progress bars showing current picks
- **Confidence slider**: How sure are you? (1-100%)
- Join button once you pick an outcome

## Data Flow (Pre-Backend)

Currently all data is mocked with `console.log` alerts. To connect to a backend:

1. **Replace mock data** in each route with API calls
2. **Add authentication** (Firebase, Auth0, custom)
3. **Store data** (groups, bets, picks, consequences)
4. **Real-time updates** for live bet counts

### Example Integration Point

In `/create-bet.tsx`, line ~150:
```typescript
// Currently:
alert("Bet created! (feature coming soon)");

// Will become:
const newBet = await createBet(betData);
navigate(`/bet/${newBet.id}`);
```

## Mobile Design System

All pages follow these patterns:

### Layout
- Max width of 384px (sm breakpoint) for readability
- Full height screen (min-h-screen)
- Safe padding (p-4) on all edges
- Phone bezel effect on welcome page

### Colors
- **Dark background**: `from-gray-900 via-gray-800 to-black`
- **Accent gradient**: `from-blue-500 via-purple-500 to-pink-500`
- **Glass effect**: `bg-white/10 border-white/20` with `backdrop-blur-md`
- **Text**: White with varying opacity (white/70, white/50 for secondary)

### Interactive Elements
- Buttons: Clear gradient or glass style
- Disabled buttons: Lower opacity + cursor-not-allowed
- Hover states: Slight background/border brightening
- Active states: Stronger color (e.g., blue-400)

### Emojis
Used for quick visual identification:
- 🎲 Bets
- 👥 Groups
- 📊 Scoreboard
- 🍽️ 🗑️ 🧹 etc. for stakes
- 😀 😎 🥳 etc. for user avatars

## Feature Checklist (MVP)

### ✅ Complete
- [x] Welcome/intro page with phone UI
- [x] Dashboard with groups and active bets
- [x] Create bet wizard (5 steps)
- [x] Join group with invite code
- [x] Group page with scoreboard
- [x] Bet details page with confidence slider
- [x] TypeScript types for all data

### 🔄 Ready to Connect
- [ ] Save bets to database
- [ ] Track user picks/selections
- [ ] Store confidence levels
- [ ] Update scoreboard in real-time
- [ ] Implement bet resolution (manual or auto)
- [ ] Track completed consequences

### 🚀 Advanced Features
- [ ] Auto-resolution for sports/weather APIs
- [ ] Proof system (photo uploads)
- [ ] Escalation for dodged bets
- [ ] Badges and achievements
- [ ] Push notifications
- [ ] Chat for bet discussions

## Testing the App Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Visit http://localhost:5173

# Test flow:
# 1. Click "Get Started" on welcome
# 2. Click "New Bet" on dashboard
# 3. Go through all 5 steps
# 4. Click "Create Bet" (shows alert)
# 5. Go back, click "Join Group"
# 6. Enter name + emoji + code
# 7. Click on group to see scoreboard
# 8. Click on a bet to see details
# 9. Pick an outcome and adjust confidence
# 10. Click "Join This Bet"
```

## File Organization

```
app/
├── routes/                    # Page components
│   ├── home.tsx              # Welcome with phone UI
│   ├── dashboard.tsx         # Groups + active bets
│   ├── create-bet.tsx        # Bet wizard
│   ├── join-group.tsx        # Group signup
│   ├── group.tsx             # Group details + scoreboard
│   ├── bet.tsx               # Bet details + join
│   └── +types/               # Route meta types (auto-generated)
├── components/               # Reusable components
│   ├── EventTypePicker.tsx
│   ├── OutcomeBuilder.tsx
│   ├── StakeSelector.tsx
│   └── DeadlinePicker.tsx
├── types/
│   └── index.ts             # All TypeScript interfaces
├── app.css                  # Global styles
└── routes.ts               # Route definitions
```

## Next Steps for Development

1. **Choose a backend** (Firebase, Supabase, custom Node.js)
2. **Set up auth** (email, Google, Discord)
3. **Replace mock data** with real API calls
4. **Add real-time listeners** for live updates
5. **Test on actual phones** (Chrome DevTools or physical device)
6. **Deploy** (Vercel, Netlify, or your host)

---

**Remember**: This is a hackathon project - iterate fast, ship often, and improve based on user feedback! 🚀
