# Bet → Consequence 🎲

A mobile-first web app where friends make bets and pay up with chores instead of money.

## Quick Start

```bash
cd my-react-router-app
npm install
npm run dev
```

Visit `http://localhost:5173`

## Project Structure

```
app/
├── routes/
│   ├── home.tsx          # Welcome page with phone UI
│   ├── dashboard.tsx     # Main dashboard (groups & active bets)
│   ├── create-bet.tsx    # Bet creation wizard
│   ├── join-group.tsx    # Quick signup + invite code entry
│   └── group.tsx         # Group details & scoreboard
├── components/
│   ├── EventTypePicker.tsx    # Sports/TV/Weather/Custom selector
│   ├── OutcomeBuilder.tsx     # Add outcomes for the bet
│   ├── StakeSelector.tsx      # Choose chore (dishes, trash, etc.)
│   └── DeadlinePicker.tsx     # Set when betting locks
├── types/
│   └── index.ts          # TypeScript interfaces for all data
└── app.css              # Global styles + mobile optimization
```

## Key Features (MVP Complete)

### ✅ Implemented
- **Phone UI**: Beautiful phone frame with notch, status bar, and home indicator
- **Welcome page**: Intro with "Get Started" button
- **Group management**: Join groups with invite codes
- **Bet creation wizard**: 5-step flow
  1. Pick event type (sports, TV, weather, custom)
  2. Describe the event
  3. Define outcomes (2+ options)
  4. Choose stake (dishes, trash, vacuum, lunch, boba, drive, cook, or custom)
  5. Set deadline (when betting locks)
- **Dashboard**: View active bets and group scoreboard
- **Scoreboard**: Member wins/losses and streaks
- **Mobile-optimized**: Responsive design, touch-friendly buttons

### 🔄 Next Steps

1. **Backend Integration**
   - Connect to Firebase/Supabase for user auth
   - Store groups, bets, and picks in database
   - Real-time updates when bets resolve

2. **Bet Resolution**
   - Manual resolution (host picks winner)
   - Confirmations/voting system to prevent cheating
   - Auto-resolution for sports/weather APIs

3. **Consequences**
   - Track who owes what
   - Proof system (photos/receipts)
   - Escalation if not completed

4. **Advanced Features**
   - Confidence sliders for weighted odds
   - Proof upload for completed chores
   - Badges/achievements
   - Escalation system for dodged bets

## Tech Stack

- **React Router v7** (framework)
- **TypeScript** (type safety)
- **Tailwind CSS** (styling with mobile-first approach)
- **Vite** (bundler)

## Component Deep Dives

### EventTypePicker
Lets users choose between:
- 🏀 Sports (e.g., "Raptors vs Lakers")
- 📺 TV/Entertainment (e.g., "Love Island: who gets dumped?")
- 🌧️ Weather (e.g., "Will it rain tomorrow?")
- 🎲 Custom (e.g., "Who shows up late first?")

### OutcomeBuilder
- Start with 2 default empty fields
- Add more outcomes (3, 4, or more)
- Remove outcomes if needed
- Continue button enabled when 2+ outcomes filled

### StakeSelector
Grid of 7 emoji-based templates:
- 🍽️ Dishes
- 🗑️ Take out trash
- 🧹 Vacuum
- 🍔 Buy lunch
- 🧋 Buy boba
- 🚗 Drive next time
- 🍳 Cook dinner

Plus a custom text input for anything else.

### DeadlinePicker
- Date input
- Time input
- Shows formatted deadline
- Validates it's in the future

## Bet Data Model

```typescript
interface Bet {
  id: string;
  groupId: string;
  hostId: string;
  title: string;
  eventType: "sports" | "entertainment" | "weather" | "custom";
  outcomes: BetOutcome[];
  stake: {
    type: string;
    description: string;
  };
  deadline: Date;
  status: "open" | "locked" | "resolved" | "completed";
}
```

## How to Add Backend

1. **Create Firestore rules** for groups, bets, and picks
2. **Add auth** (Google Sign-In or Email)
3. **Replace console.log alerts** with actual API calls
4. **Implement real-time listeners** for bet updates
5. **Add proof upload** to Cloud Storage

Example Firebase integration point in `create-bet.tsx`:

```typescript
const handleCreateBet = async () => {
  const bet = await db.collection("bets").add({
    ...betData,
    hostId: auth.currentUser.uid,
    groupId: currentGroupId,
    createdAt: new Date(),
    status: "open",
  });
  navigate(`/bet/${bet.id}`);
};
```

## Styling Notes

- **Phone UI**: Black bezel, notch at top, home indicator at bottom
- **Gradient backgrounds**: Blue→Purple→Pink on light, Gray on dark
- **Glassmorphism**: Semi-transparent cards with backdrop blur
- **Responsive**: Works on phones (max-w-sm container)
- **Emojis**: Used throughout for visual feedback

## Future Enhancements

- Proof system (upload photos of completed chores)
- Auto-resolution from sports APIs
- Confidence sliders for weighted odds
- Escalation system if bet not completed
- Badges/achievements (e.g., "Never dodged a bet")
- Chat for bet discussions
- Invite links (vs just codes)
- Notifications for unresolved bets

---

**Built for hackathons. Ship it and iterate!** 🚀
