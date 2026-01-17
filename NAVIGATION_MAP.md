# 🎲 Bet → Consequence - App Navigation Map

## Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      WELCOME PAGE (/)                       │
│  - Beautiful phone mockup with intro                        │
│  - "Get Started" button → /dashboard                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   DASHBOARD (/dashboard)                    │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  ➕ New Bet         │  │  🤝 Join Group       │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                              │
│  📋 YOUR GROUPS (click to view)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ House 511 (4 members)                                │  │
│  │ Roommates (3 members)                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  🏀 ACTIVE BETS (click to view)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Raptors vs Lakers | Your pick: Raptors | 24h left   │  │
│  │ Love Island dumped | Your pick: Person A | 12h left │  │
│  └──────────────────────────────────────────────────────┘  │
└──────┬────────────────────────────────────────────────────┬─┘
       │                                                      │
       ▼                                                      ▼
┌──────────────────────────┐                 ┌──────────────────────────┐
│   CREATE BET             │                 │  JOIN GROUP              │
│   (/create-bet)          │                 │  (/join-group)           │
│                          │                 │                          │
│ Step 1: Event Type       │                 │ Step 1: Name + Emoji     │
│  🏀 Sports              │                 │ ┌────────────────────┐   │
│  📺 TV/Entertainment    │                 │ │ Name: [________]   │   │
│  🌧️ Weather            │                 │ │ Pick emoji: 😀😎🥳 │   │
│  🎲 Custom             │                 │ └────────────────────┘   │
│                          │                 │                          │
│ Step 2: Event Details    │                 │ Step 2: Invite Code      │
│ Title: [____________]    │                 │ ┌────────────────────┐   │
│ Desc: [____________]     │                 │ │ Code: [ABC123 ]    │   │
│                          │                 │ │ (ask your host)    │   │
│ Step 3: Outcomes         │                 │ └────────────────────┘   │
│ ☑ Raptors win           │                 │                          │
│ ☑ Lakers win            │                 │ [Join Group]             │
│ [+ Add outcome]          │                 └──────────────────────────┘
│                          │
│ Step 4: Consequence      │
│ [🍽️ Dishes]           │
│ [🗑️ Trash]            │
│ [🧹 Vacuum]            │
│ [🍔 Lunch]             │
│ [🧋 Boba]              │
│ [🚗 Drive]             │
│ [🍳 Cook]              │
│ [Custom: _____]         │
│                          │
│ Step 5: Deadline         │
│ Date: [Jan 20 2025]      │
│ Time: [7:30 PM]          │
│                          │
│ Review:                  │
│ [Show all details]       │
│                          │
│ [Create Bet]             │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│            GROUP PAGE (/group/:id)                           │
│                                                               │
│  House 511                                                    │
│  [➕ New Bet] [📋 Invite Code]                              │
│                                                               │
│  🏆 SCOREBOARD                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 😎 Jay      | 5W - 2L | 🔥3 (3-game win streak)   │   │
│  │ 🥳 Eva      | 4W - 3L | ❄️1 (just lost)          │   │
│  │ 🚀 Alex     | 3W - 4L | 🔥1 (on a roll)          │   │
│  │ 💎 Sam      | 2W - 5L | ❄️2 (rough patch)        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  🎲 BETS IN THIS GROUP (click to join)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Raptors vs Lakers        [open]  (4/7 people picked) │   │
│  │ Love Island: Who dumped  [locked]  (3/7 people)     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│           BET DETAILS (/bet/:id)                             │
│                                                               │
│  Raptors vs Lakers                                            │
│  Host: 😎 Jay                                                │
│  Consequence: 🍔 Buy lunch for the group                     │
│  Closes in: 22h 15m (Jan 20, 7:30 PM)                        │
│                                                               │
│  📊 CURRENT PICKS                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ☐ Raptors win                           4 people (57%) │   │
│  │   [████████████████████░░░░░░░░░░░░░░] 57%           │   │
│  │                                                         │   │
│  │ ☐ Lakers win                            3 people (43%) │   │
│  │   [█████████████░░░░░░░░░░░░░░░░░░░░░] 43%           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  CLICK OUTCOME TO JOIN...                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 🎚️ YOUR CONFIDENCE: [🔘════════════════════] 50%  │   │
│  │    "50/50" - You're unsure                          │   │
│  │                                                         │   │
│  │ [Join This Bet 🎲]                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## Route Map

```
App Routes (React Router)
│
├── /                          → home.tsx (Welcome page)
│
├── /dashboard                 → dashboard.tsx (Main hub)
│
├── /create-bet                → create-bet.tsx (5-step wizard)
│   ├── Step 1: EventTypePicker.tsx
│   ├── Step 2: Event details form
│   ├── Step 3: OutcomeBuilder.tsx
│   ├── Step 4: StakeSelector.tsx
│   ├── Step 5: DeadlinePicker.tsx
│   └── Review & create
│
├── /join-group                → join-group.tsx (Invite code entry)
│   ├── Name + Emoji input
│   └── 6-char code entry
│
├── /group/:id                 → group.tsx (Group details)
│   ├── Scoreboard (all members)
│   ├── Bets list
│   └── Action buttons
│
└── /bet/:id                   → bet.tsx (Bet details)
    ├── Outcome selection
    ├── Confidence slider
    └── Join button
```

## Data Flow (What Happens)

```
User Opens App
    ↓
Welcome Page
    ↓
"Get Started" → Dashboard
    ↓
(Choose: New Bet OR Join Group)
    ├─→ New Bet
    │   ├─ Pick event type
    │   ├─ Describe event
    │   ├─ Add outcomes
    │   ├─ Choose stake
    │   ├─ Set deadline
    │   ├─ Review all details
    │   └─ Create Bet → Dashboard
    │
    └─→ Join Group
        ├─ Enter name + emoji
        ├─ Enter invite code
        └─ Redirected to Group
                ↓
        Group Page
            ├─ View scoreboard
            ├─ Click on active bet
            └─ Bet Details Page
                    ├─ Click outcome
                    ├─ Adjust confidence
                    └─ Join Bet → Dashboard
```

## Key UI Elements

### Buttons
- Primary: Gradient blue→purple (action buttons)
- Success: Green (confirm/join)
- Danger: Red (remove/delete)
- Secondary: Glass effect (alternative actions)

### Inputs
- Text: Glass style with white border
- Date/Time: Native HTML5 pickers
- Range: Confidence slider
- Buttons: Toggle states for selections

### Cards
- Glass morphism: Semi-transparent + blur
- Gradient borders: Blue→purple
- Hover states: Brighter background
- Active states: Colored highlight

### Icons
- All text-based emojis (no image assets needed)
- Quick recognition (dish = 🍽️, trash = 🗑️)
- User avatars are emojis (😎, 🥳, 🚀, etc.)

---

**Total Routes: 6**
**Total Components: 4 reusable**
**Total Pages Built: 6**
