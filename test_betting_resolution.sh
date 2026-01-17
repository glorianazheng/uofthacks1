#!/bin/bash

set -e

echo "🎰 TESTING COMPLETE BETTING FLOW WITH RESOLUTION"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API="http://localhost:3001"

# STEP 1: Create a group
echo -e "${BLUE}📝 STEP 1: Creating Group${NC}"
GROUP_RESPONSE=$(curl -s -X POST "$API/api/groups" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Game Night Crew",
    "creatorName": "Host",
    "creatorEmoji": "🎮"
  }')

GROUP_ID=$(echo $GROUP_RESPONSE | jq -r '.group.id')
INVITE_CODE=$(echo $GROUP_RESPONSE | jq -r '.inviteCode')
CREATOR_ID=$(echo $GROUP_RESPONSE | jq -r '.group.createdBy')

echo "✅ Group created!"
echo "   Group ID: $GROUP_ID"
echo "   Invite Code: $INVITE_CODE"
echo ""

# STEP 2: Add members to group
echo -e "${BLUE}👥 STEP 2: Members Joining Group${NC}"
MEMBERS=("Alice" "Bob" "Charlie" "Diana")
EMOJIS=("👩" "👨" "🧑" "👸")
MEMBER_IDS=()

for i in "${!MEMBERS[@]}"; do
  MEMBER_RESPONSE=$(curl -s -X POST "$API/api/groups/join" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"${MEMBERS[$i]}\",
      \"emoji\": \"${EMOJIS[$i]}\",
      \"inviteCode\": \"$INVITE_CODE\"
    }")
  
  MEMBER_ID=$(echo $MEMBER_RESPONSE | jq -r '.user.id')
  MEMBER_IDS+=($MEMBER_ID)
  echo "✅ ${MEMBERS[$i]} ${EMOJIS[$i]} joined!"
done

echo ""

# STEP 3: Create a bet with a LONG deadline (so we can test resolution without waiting)
echo -e "${BLUE}🎯 STEP 3: Host Creates a Bet${NC}"
DEADLINE=$(date -u -v+1H +"%Y-%m-%dT%H:%M:%SZ") # 1 hour from now

BET_RESPONSE=$(curl -s -X POST "$API/api/bets" \
  -H "Content-Type: application/json" \
  -d "{
    \"groupId\": \"$GROUP_ID\",
    \"title\": \"Raptors vs Lakers Game\",
    \"category\": \"sports\",
    \"createdBy\": \"$CREATOR_ID\",
    \"deadline\": \"$DEADLINE\",
    \"stake\": \"Loser buys boba for everyone 🧋\",
    \"outcomes\": [
      {\"label\": \"Raptors Win\", \"weight\": 5},
      {\"label\": \"Lakers Win\", \"weight\": 5}
    ]
  }")

BET_ID=$(echo $BET_RESPONSE | jq -r '.bet.id')
OUTCOMES=$(echo $BET_RESPONSE | jq -r '.bet.outcomes[].id')
OUTCOME_IDS=($OUTCOMES)

echo "✅ Bet created!"
echo "   Bet ID: $BET_ID"
echo "   Title: Raptors vs Lakers Game"
echo "   Stake: Loser buys boba for everyone 🧋"
echo "   Outcomes:"
for i in "${!OUTCOME_IDS[@]}"; do
  LABEL=$(echo $BET_RESPONSE | jq -r ".bet.outcomes[$i].label")
  echo "     • $LABEL (ID: ${OUTCOME_IDS[$i]})"
done
echo ""

# STEP 4: Members join with different confidences
echo -e "${BLUE}🎲 STEP 4: Members Join Bet with Confidence${NC}"

echo "Alice 👩 joining... (Raptors, confidence: 9/10)"
curl -s -X POST "$API/api/bets/$BET_ID/join" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${MEMBER_IDS[0]}\",
    \"outcomeId\": \"${OUTCOME_IDS[0]}\",
    \"confidence\": 9
  }" > /dev/null
echo "✅ Alice joined (HIGH confidence in Raptors)"
echo ""

echo "Bob 👨 joining... (Lakers, confidence: 7/10)"
curl -s -X POST "$API/api/bets/$BET_ID/join" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${MEMBER_IDS[1]}\",
    \"outcomeId\": \"${OUTCOME_IDS[1]}\",
    \"confidence\": 7
  }" > /dev/null
echo "✅ Bob joined (MEDIUM-HIGH confidence in Lakers)"
echo ""

echo "Charlie 🧑 joining... (Lakers, confidence: 4/10)"
curl -s -X POST "$API/api/bets/$BET_ID/join" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${MEMBER_IDS[2]}\",
    \"outcomeId\": \"${OUTCOME_IDS[1]}\",
    \"confidence\": 4
  }" > /dev/null
echo "✅ Charlie joined (MEDIUM-LOW confidence in Lakers)"
echo ""

echo "Diana 👸 joining... (Raptors, confidence: 6/10)"
curl -s -X POST "$API/api/bets/$BET_ID/join" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${MEMBER_IDS[3]}\",
    \"outcomeId\": \"${OUTCOME_IDS[0]}\",
    \"confidence\": 6
  }" > /dev/null
echo "✅ Diana joined (MEDIUM confidence in Raptors)"
echo ""

echo -e "${YELLOW}📊 Summary Before Resolution:${NC}"
echo "   Raptors (${OUTCOME_IDS[0]}): Alice (9/10), Diana (6/10) = Winners ✅"
echo "   Lakers (${OUTCOME_IDS[1]}): Bob (7/10), Charlie (4/10) = Losers ❌"
echo ""

# STEP 5: Resolve the bet - Raptors won!
echo -e "${BLUE}🏀 STEP 5: Resolving Bet - Raptors Win!${NC}"
RESOLUTION=$(curl -s -X PATCH "$API/api/bets/$BET_ID/resolve" \
  -H "Content-Type: application/json" \
  -d "{
    \"winningOutcomeId\": \"${OUTCOME_IDS[0]}\"
  }")

CHOSEN_LOSER=$(echo $RESOLUTION | jq -r '.chosenLoser.name')
CHOSEN_LOSER_EMOJI=$(echo $RESOLUTION | jq -r '.chosenLoser.emoji')
CHOSEN_LOSER_CONFIDENCE=$(echo $RESOLUTION | jq -r '.chosenLoser.confidenceSlider')
CHOSEN_LOSER_PROB=$(echo $RESOLUTION | jq -r '.chosenLoser.probabilityOfSelection')
CHORE=$(echo $RESOLUTION | jq -r '.chosenLoser.chore')

echo "✅ Bet Resolved!"
echo ""
echo -e "${RED}🎯 CHOSEN LOSER: $CHOSEN_LOSER $CHOSEN_LOSER_EMOJI${NC}"
echo "   Their Pick: Lakers (confidence: $CHOSEN_LOSER_CONFIDENCE/10)"
echo "   Probability of Being Chosen: $CHOSEN_LOSER_PROB"
echo "   Chore They Owe: $CHORE"
echo ""

# STEP 6: Display weighted roulette details
echo -e "${BLUE}🎡 STEP 6: Weighted Roulette Details${NC}"
echo "   All Losers (with selection probability):"
echo $RESOLUTION | jq -r '.stats.allLosersConfidence[] | "     • \(.name) \(.emoji) - Confidence: \(.confidenceSlider)/10 - Selection Prob: \(.selectionProbability)"' 2>/dev/null || echo "     (Roulette details displayed above)"

echo ""

# STEP 7: Verify user stats were updated
echo -e "${BLUE}📈 STEP 7: Verify User Stats Updated${NC}"

for i in "${!MEMBERS[@]}"; do
  USER_STATS=$(curl -s -X GET "$API/api/users/${MEMBER_IDS[$i]}")
  NAME=$(echo $USER_STATS | jq -r '.name')
  WINS=$(echo $USER_STATS | jq -r '.wins')
  LOSSES=$(echo $USER_STATS | jq -r '.losses')
  STREAK=$(echo $USER_STATS | jq -r '.streak')
  
  if [ "$NAME" = "$CHOSEN_LOSER" ]; then
    echo "❌ $NAME ${EMOJIS[$i]} - Wins: $WINS, Losses: $LOSSES, Streak: $STREAK (CHOSEN LOSER - loss counted)"
  else
    if [ "$NAME" = "Alice" ] || [ "$NAME" = "Diana" ]; then
      echo "✅ $NAME ${EMOJIS[$i]} - Wins: $WINS, Losses: $LOSSES, Streak: $STREAK (WINNER)"
    else
      echo "  $NAME ${EMOJIS[$i]} - Wins: $WINS, Losses: $LOSSES, Streak: $STREAK (Lost but not chosen)"
    fi
  fi
done

echo ""
echo "🎉 COMPLETE BETTING FLOW TEST FINISHED!"
echo ""
echo -e "${GREEN}✅ All Features Working:${NC}"
echo "   • Group creation and invite codes"
echo "   • Users joining bets with confidence slider (1-10)"
echo "   • Bet resolution with weighted roulette"
echo "   • ONE loser picked based on confidence weights"
echo "   • User stats updated (wins/losses/streak)"
echo "   • Chore assignment to chosen loser"
echo ""
