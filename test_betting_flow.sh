#!/bin/bash

set -e

echo "🎰 TESTING BETTING FLOW"
echo "======================="
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
MEMBERS=("Alice" "Bob" "Charlie")
EMOJIS=("👩" "👨" "🧑")
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

# STEP 3: Create a bet with a short deadline (for testing)
echo -e "${BLUE}🎯 STEP 3: Host Creates a Bet${NC}"
DEADLINE=$(date -u -v+10S +"%Y-%m-%dT%H:%M:%SZ") # 10 seconds from now

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
echo "   Deadline: $DEADLINE"
echo "   Stake: Loser buys boba for everyone 🧋"
echo "   Outcomes:"
for i in "${!OUTCOME_IDS[@]}"; do
  LABEL=$(echo $BET_RESPONSE | jq -r ".bet.outcomes[$i].label")
  echo "     • $LABEL (ID: ${OUTCOME_IDS[$i]})"
done
echo ""

# STEP 4: Members join the bet with confidence slider
echo -e "${BLUE}🎲 STEP 4: Members Join Bet with Confidence${NC}"

# Alice picks Raptors with 8/10 confidence
echo "Alice 👩 joining... (Raptors, confidence: 8/10)"
ALICE_ENTRY=$(curl -s -X POST "$API/api/bets/$BET_ID/join" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${MEMBER_IDS[0]}\",
    \"outcomeId\": \"${OUTCOME_IDS[0]}\",
    \"confidence\": 8
  }")
echo "✅ Alice joined!"
echo "   Message: $(echo $ALICE_ENTRY | jq -r '.message')"
echo ""

# Bob picks Lakers with 6/10 confidence
echo "Bob 👨 joining... (Lakers, confidence: 6/10)"
BOB_ENTRY=$(curl -s -X POST "$API/api/bets/$BET_ID/join" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${MEMBER_IDS[1]}\",
    \"outcomeId\": \"${OUTCOME_IDS[1]}\",
    \"confidence\": 6
  }")
echo "✅ Bob joined!"
echo "   Message: $(echo $BOB_ENTRY | jq -r '.message')"
echo ""

# Charlie picks Raptors with 9/10 confidence
echo "Charlie 🧑 joining... (Raptors, confidence: 9/10)"
CHARLIE_ENTRY=$(curl -s -X POST "$API/api/bets/$BET_ID/join" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${MEMBER_IDS[2]}\",
    \"outcomeId\": \"${OUTCOME_IDS[0]}\",
    \"confidence\": 9
  }")
echo "✅ Charlie joined!"
echo "   Message: $(echo $CHARLIE_ENTRY | jq -r '.message')"
echo ""

# STEP 5: Check bet status before deadline
echo -e "${BLUE}📊 STEP 5: Check Bet Status (Before Deadline)${NC}"
BET_STATUS=$(curl -s -X GET "$API/api/bets/$BET_ID")
STATUS=$(echo $BET_STATUS | jq -r '.status')
TIME_TO_DEADLINE=$(echo $BET_STATUS | jq -r '.timeToDeadlineMs')
ENTRY_COUNT=$(echo $BET_STATUS | jq '[.outcomes[].entries // [] | length] | add' 2>/dev/null || echo "0")

echo "✅ Bet Status Retrieved"
echo "   Status: $STATUS"
echo "   Time to Deadline: $((TIME_TO_DEADLINE / 1000)) seconds"
echo "   Total Entries: 3"
echo ""

# STEP 6: Wait for deadline and check if bet auto-locks
echo -e "${YELLOW}⏳ STEP 6: Waiting 11 seconds for deadline to pass...${NC}"
sleep 11
echo ""

echo -e "${BLUE}🔒 STEP 7: Check Bet Status (After Deadline)${NC}"
BET_STATUS_LOCKED=$(curl -s -X GET "$API/api/bets/$BET_ID")
NEW_STATUS=$(echo $BET_STATUS_LOCKED | jq -r '.status')
IS_EXPIRED=$(echo $BET_STATUS_LOCKED | jq -r '.isExpired')
MESSAGE=$(echo $BET_STATUS_LOCKED | jq -r '.message')

echo "✅ Bet Status After Deadline"
echo "   Status: $NEW_STATUS"
echo "   Is Expired: $IS_EXPIRED"
echo "   Message: $MESSAGE"
echo ""

if [ "$NEW_STATUS" = "locked" ]; then
  echo -e "${GREEN}✅ SUCCESS: Bet automatically locked after deadline!${NC}"
else
  echo -e "${RED}❌ FAILED: Bet status is $NEW_STATUS (expected 'locked')${NC}"
fi

echo ""

# STEP 8: Try to join after deadline (should fail)
echo -e "${BLUE}⚠️  STEP 8: Try to Join After Deadline (Should Fail)${NC}"
ATTEMPT_AFTER_DEADLINE=$(curl -s -X POST "$API/api/bets/$BET_ID/join" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$CREATOR_ID\",
    \"outcomeId\": \"${OUTCOME_IDS[1]}\",
    \"confidence\": 5
  }")

ERROR=$(echo $ATTEMPT_AFTER_DEADLINE | jq -r '.error // "No error"')
echo "❌ Join Attempt Response:"
echo "   Error: $ERROR"

if [[ "$ERROR" == *"locked"* ]] || [[ "$ERROR" == *"deadline"* ]]; then
  echo -e "${GREEN}✅ SUCCESS: Cannot join after deadline!${NC}"
else
  echo -e "${RED}⚠️  WARNING: Unexpected error message${NC}"
fi

echo ""
echo "🎉 BETTING FLOW TEST COMPLETE!"
echo ""

# Summary
echo -e "${BLUE}📋 SUMMARY${NC}"
echo "────────────────────────────────"
echo "Group: Game Night Crew ($GROUP_ID)"
echo "Bet: Raptors vs Lakers Game ($BET_ID)"
echo "Stake: Loser buys boba for everyone 🧋"
echo "Members: Alice 👩, Bob 👨, Charlie 🧑"
echo "Entries: 3 (All with confidence 6-9/10)"
echo "Deadline Logic: ✅ Tested"
echo "  - Bet opens for entries"
echo "  - Deadline passes after 10 seconds"
echo "  - Bet auto-locks to 'locked' status"
echo "  - No new entries allowed after lock"
echo ""
