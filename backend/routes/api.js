import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import {
  User,
  Group,
  GroupMember,
  Friendship,
  Bet,
  Outcome,
  Entry,
  sequelize,
} from '../database.js';

const router = express.Router();

// ============================================
// AUTHENTICATION ROUTES
// ============================================

/**
 * POST /api/auth/signup
 * Create a new user account
 * Body: { username, password, name, emoji }
 */
router.post('/auth/signup', async (req, res, next) => {
  try {
    const { username, password, name, emoji } = req.body;

    // Validation
    if (!username || !password || !name || !emoji) {
      return res.status(400).json({
        error: 'username, password, name, and emoji are required',
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        error: 'username must be at least 3 characters',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'password must be at least 6 characters',
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({
        error: 'username already taken',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      id: uuidv4(),
      username,
      password: hashedPassword,
      name,
      emoji,
      wins: 0,
      losses: 0,
      streak: 0,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login with username and password
 * Body: { username, password }
 */
router.post('/auth/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'username and password are required',
      });
    }

    // Find user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        error: 'invalid username or password',
      });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        error: 'invalid username or password',
      });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// ============================================
// USERS ROUTES
// ============================================

/**
 * POST /api/users
 * Create a new user
 * Body: { name, emoji }
 */
router.post('/users', async (req, res, next) => {
  try {
    const { name, emoji } = req.body;

    if (!name || !emoji) {
      return res.status(400).json({
        error: 'name and emoji are required',
      });
    }

    const user = await User.create({
      id: uuidv4(),
      name,
      emoji,
      wins: 0,
      losses: 0,
      streak: 0,
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:id
 * Get a user by ID
 */
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/:id
 * Update a user
 * Body: { name, emoji, wins, losses, streak }
 */
router.put('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    const { name, emoji, wins, losses, streak } = req.body;
    if (name) user.name = name;
    if (emoji) user.emoji = emoji;
    if (wins !== undefined) user.wins = wins;
    if (losses !== undefined) user.losses = losses;
    if (streak !== undefined) user.streak = streak;

    await user.save();
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// ============================================
// GROUPS ROUTES
// ============================================

/**
 * POST /api/groups
 * Create a new group
 * Body: { name, creatorName, creatorEmoji }
 */
router.post('/groups', async (req, res, next) => {
  try {
    const { name, creatorName, creatorEmoji } = req.body;

    if (!name || !creatorName || !creatorEmoji) {
      return res.status(400).json({
        error: 'name, creatorName, and creatorEmoji are required',
      });
    }

    // Create the creator user
    const creator = await User.create({
      id: uuidv4(),
      name: creatorName,
      emoji: creatorEmoji,
      wins: 0,
      losses: 0,
      streak: 0,
    });

    // Generate 6-character invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const group = await Group.create({
      id: uuidv4(),
      name,
      createdBy: creator.id,
      inviteCode,
    });

    // Add creator as a member
    await GroupMember.create({
      userId: creator.id,
      groupId: group.id,
    });

    res.status(201).json({
      message: `Group "${name}" created! Share invite code: ${inviteCode}`,
      group: {
        ...group.toJSON(),
        creator,
      },
      inviteCode,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/groups/join
 * Join a group with invite code
 * Body: { name, emoji, inviteCode }
 * Creates a new user if they don't exist, then adds them to the group
 */
router.post('/groups/join', async (req, res, next) => {
  try {
    const { name, emoji, inviteCode } = req.body;

    if (!name || !emoji || !inviteCode) {
      return res.status(400).json({
        error: 'name, emoji, and inviteCode are required',
      });
    }

    // Find the group by invite code
    const group = await Group.findOne({
      where: { inviteCode: inviteCode.toUpperCase() },
    });

    if (!group) {
      return res.status(404).json({
        error: 'Invalid invite code',
      });
    }

    // Create a new user
    const user = await User.create({
      id: uuidv4(),
      name,
      emoji,
      wins: 0,
      losses: 0,
      streak: 0,
    });

    // Add user to group
    await GroupMember.create({
      userId: user.id,
      groupId: group.id,
    });

    res.status(201).json({
      message: `Welcome ${name}! Successfully joined group: ${group.name}`,
      user,
      group,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/groups/:id
 * Get a group with members
 */
router.get('/groups/:id', async (req, res, next) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'members',
          through: { attributes: [] },
        },
      ],
    });

    if (!group) {
      return res.status(404).json({
        error: 'Group not found',
      });
    }

    res.json(group);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/groups/:groupId/bets
 * Get all bets in a group
 */
router.get('/groups/:groupId/bets', async (req, res, next) => {
  try {
    const bets = await Bet.findAll({
      where: { groupId: req.params.groupId },
      include: [
        {
          model: Outcome,
          as: 'outcomes',
        },
      ],
    });

    res.json(bets);
  } catch (error) {
    next(error);
  }
});

// ============================================
// BETS ROUTES
// ============================================

// ============================================
// HELPER FUNCTION: Check if bet deadline has passed
// ============================================
const checkAndLockBetIfExpired = async (bet) => {
  if (bet.status === 'open' && new Date() > new Date(bet.deadline)) {
    bet.status = 'locked';
    await bet.save();
    return true; // Was locked
  }
  return false; // Was already locked or deadline hasn't passed
};

/**
 * POST /api/bets
 * Create a new bet (Host creates a bet with options, stake, and deadline)
 * Body: { 
 *   groupId,
 *   title,
 *   category,
 *   createdBy (userId),
 *   deadline (ISO string),
 *   stake (e.g., "Buy Boba"),
 *   outcomes: [{ label: "Raptors", weight: 5 }, { label: "Lakers", weight: 5 }]
 * }
 */
router.post('/bets', async (req, res, next) => {
  try {
    const { groupId, title, category, createdBy, deadline, stake, outcomes } = req.body;

    if (!groupId || !title || !createdBy || !deadline || !stake) {
      return res.status(400).json({
        error: 'groupId, title, createdBy, deadline, and stake are required',
      });
    }

    if (!outcomes || !Array.isArray(outcomes) || outcomes.length < 2) {
      return res.status(400).json({
        error: 'At least 2 outcomes are required',
      });
    }

    // Validate deadline is in the future
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return res.status(400).json({
        error: 'Deadline must be in the future',
      });
    }

    const bet = await Bet.create({
      id: uuidv4(),
      groupId,
      title,
      category: category || 'custom',
      createdBy,
      deadline: deadlineDate,
      stake,
      status: 'open',
    });

    // Add outcomes
    const createdOutcomes = [];
    for (const outcome of outcomes) {
      const createdOutcome = await Outcome.create({
        id: uuidv4(),
        betId: bet.id,
        label: outcome.label,
        weight: outcome.weight || 1,
      });
      createdOutcomes.push(createdOutcome);
    }

    const betWithOutcomes = await Bet.findByPk(bet.id, {
      include: [
        {
          model: Outcome,
          as: 'outcomes',
        },
      ],
    });

    res.status(201).json({
      message: `Bet "${title}" created with ${outcomes.length} options. Deadline: ${deadline}`,
      bet: betWithOutcomes,
      outcomes: createdOutcomes,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/bets/:id/join
 * Join a bet by picking a side and setting confidence
 * Body: { userId, outcomeId, confidence (1-10) }
 * 
 * Logic:
 * - Checks if deadline has passed
 * - If past deadline, automatically locks the bet
 * - Prevents new entries if bet is locked
 * - Creates entry with user's confidence slider value (1-10)
 */
router.post('/bets/:id/join', async (req, res, next) => {
  try {
    const { userId, outcomeId, confidence } = req.body;

    if (!userId || !outcomeId || confidence === undefined) {
      return res.status(400).json({
        error: 'userId, outcomeId, and confidence are required',
      });
    }

    if (confidence < 1 || confidence > 10) {
      return res.status(400).json({
        error: 'Confidence must be between 1 and 10',
      });
    }

    // Get the bet
    const bet = await Bet.findByPk(req.params.id);
    if (!bet) {
      return res.status(404).json({
        error: 'Bet not found',
      });
    }

    // Check if deadline has passed and lock if needed
    const wasJustLocked = await checkAndLockBetIfExpired(bet);

    // Verify bet is still open for entries
    if (bet.status !== 'open') {
      return res.status(400).json({
        error: `Cannot join bet. Bet status is "${bet.status}".${wasJustLocked ? ' The deadline has passed.' : ''}`,
        betStatus: bet.status,
        deadline: bet.deadline,
        currentTime: new Date(),
      });
    }

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Verify outcome exists and belongs to this bet
    const outcome = await Outcome.findByPk(outcomeId);
    if (!outcome || outcome.betId !== bet.id) {
      return res.status(404).json({
        error: 'Outcome not found for this bet',
      });
    }

    // Check if user already has an entry for this bet
    const existingEntry = await Entry.findOne({
      where: {
        betId: bet.id,
        userId: userId,
      },
    });

    if (existingEntry) {
      return res.status(400).json({
        error: 'User already has an entry for this bet',
      });
    }

    // Create the entry with confidence converted to percentage (1-10 becomes 10-100)
    const confidencePercentage = confidence * 10;
    const entry = await Entry.create({
      id: uuidv4(),
      betId: bet.id,
      userId: userId,
      outcomeId: outcomeId,
      confidence: confidencePercentage,
      result: 'pending',
    });

    // Fetch the created entry with related data
    const entryWithDetails = await Entry.findByPk(entry.id, {
      include: [
        {
          model: User,
        },
        {
          model: Outcome,
        },
      ],
    });

    res.status(201).json({
      message: `${user.name} ${user.emoji} joined the bet "${bet.title}" - picking "${outcome.label}" with ${confidence}/10 confidence!`,
      entry: entryWithDetails,
      confidenceSlider: confidence,
      confidencePercentage: confidencePercentage,
      bet: {
        id: bet.id,
        title: bet.title,
        deadline: bet.deadline,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bets/:id
 * Get a bet with outcomes and entries
 * 
 * Automatically checks deadline and locks bet if expired
 */
router.get('/bets/:id', async (req, res, next) => {
  try {
    const bet = await Bet.findByPk(req.params.id, {
      include: [
        {
          model: Outcome,
          as: 'outcomes',
          include: [
            {
              model: Entry,
              as: 'entries',
            },
          ],
        },
      ],
    });

    if (!bet) {
      return res.status(404).json({
        error: 'Bet not found',
      });
    }

    // Check and lock if expired
    await checkAndLockBetIfExpired(bet);

    // Re-fetch to get updated status if it was locked
    const updatedBet = await Bet.findByPk(req.params.id, {
      include: [
        {
          model: Outcome,
          as: 'outcomes',
          include: [
            {
              model: Entry,
              as: 'entries',
            },
          ],
        },
      ],
    });

    const timeToDeadline = new Date(updatedBet.deadline) - new Date();
    const isExpired = timeToDeadline <= 0;

    res.json({
      ...updatedBet.toJSON(),
      deadline: updatedBet.deadline,
      currentTime: new Date(),
      timeToDeadlineMs: Math.max(0, timeToDeadline),
      isExpired: isExpired,
      status: updatedBet.status,
      message: isExpired ? 'Deadline has passed. Bet is locked.' : `${Math.floor(timeToDeadline / 1000)} seconds until deadline`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/bets/:id
 * Update a bet
 * Body: { status, winningOutcomeId, resolvedAt }
 */
router.put('/bets/:id', async (req, res, next) => {
  try {
    const bet = await Bet.findByPk(req.params.id);

    if (!bet) {
      return res.status(404).json({
        error: 'Bet not found',
      });
    }

    const { status, winningOutcomeId, resolvedAt } = req.body;

    if (status) bet.status = status;
    if (winningOutcomeId) bet.winningOutcomeId = winningOutcomeId;
    if (resolvedAt) bet.resolvedAt = resolvedAt;

    await bet.save();
    res.json(bet);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/bets/:id/resolve
 * Resolve a bet and pick a loser using weighted roulette
 * Body: { winningOutcomeId }
 * 
 * Logic:
 * 1. Find all users who picked the LOSING outcome
 * 2. Use weighted roulette: probability = user's confidence / sum of all losers' confidence
 * 3. Pick ONE loser based on these weights
 * 4. Return the chosen loser's name, emoji, and the chore they owe
 * 5. Update bet status to 'resolved'
 */
router.patch('/bets/:id/resolve', async (req, res, next) => {
  try {
    const { winningOutcomeId } = req.body;

    if (!winningOutcomeId) {
      return res.status(400).json({
        error: 'winningOutcomeId is required',
      });
    }

    // Get the bet
    const bet = await Bet.findByPk(req.params.id, {
      include: [
        {
          model: Outcome,
          as: 'outcomes',
          include: [
            {
              model: Entry,
              as: 'entries',
              include: [
                {
                  model: User,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!bet) {
      return res.status(404).json({
        error: 'Bet not found',
      });
    }

    // Verify winning outcome exists and belongs to this bet
    const winningOutcome = await Outcome.findByPk(winningOutcomeId);
    if (!winningOutcome || winningOutcome.betId !== bet.id) {
      return res.status(404).json({
        error: 'Winning outcome not found for this bet',
      });
    }

    // Find all losers (users who picked the losing outcome)
    const losers = [];
    for (const outcome of bet.outcomes) {
      if (outcome.id !== winningOutcomeId) {
        // This is a losing outcome
        for (const entry of outcome.entries) {
          losers.push({
            userId: entry.userId,
            name: entry.User.name,
            emoji: entry.User.emoji,
            confidence: entry.confidence, // Already in percentage (0-100)
            outcomeLabel: outcome.label,
          });
        }
      }
    }

    // If no losers, return success (all picked correctly)
    if (losers.length === 0) {
      bet.status = 'resolved';
      bet.winningOutcomeId = winningOutcomeId;
      bet.resolvedAt = new Date();
      await bet.save();

      return res.json({
        message: 'Bet resolved! Everyone picked the correct outcome!',
        bet,
        chosenLoser: null,
        totalLosers: 0,
      });
    }

    // ============================================
    // WEIGHTED ROULETTE LOGIC
    // ============================================
    // Higher confidence = higher chance of being picked
    // Probability = loser's confidence / sum of all losers' confidence

    const totalConfidence = losers.reduce((sum, loser) => sum + loser.confidence, 0);

    // Create weighted roulette wheel
    let cumulativeWeight = 0;
    const wheel = losers.map((loser) => {
      const weight = loser.confidence / totalConfidence; // Normalized probability (0-1)
      const wheelStart = cumulativeWeight;
      cumulativeWeight += weight;
      return {
        ...loser,
        weight,
        wheelStart,
        wheelEnd: cumulativeWeight,
      };
    });

    // Spin the wheel (random number between 0 and 1)
    const spin = Math.random();

    // Find which loser was picked
    const chosenLoserData = wheel.find(
      (entry) => spin >= entry.wheelStart && spin < entry.wheelEnd
    );

    const chosenLoser = chosenLoserData || wheel[wheel.length - 1]; // Fallback to last (edge case)

    // Update bet status
    bet.status = 'resolved';
    bet.winningOutcomeId = winningOutcomeId;
    bet.resolvedAt = new Date();
    await bet.save();

    // Update the chosen loser's stats
    const loserUser = await User.findByPk(chosenLoser.userId);
    if (loserUser) {
      loserUser.losses += 1;
      loserUser.streak = 0; // Reset streak on loss
      await loserUser.save();
    }

    // Calculate winning users and update their stats
    const winnersOutcome = bet.outcomes.find((o) => o.id === winningOutcomeId);
    if (winnersOutcome) {
      for (const entry of winnersOutcome.entries) {
        const winner = await User.findByPk(entry.userId);
        if (winner) {
          winner.wins += 1;
          if (winner.streak >= 0) {
            winner.streak += 1;
          } else {
            winner.streak = 1; // Reset to 1 if they were on loss streak
          }
          await winner.save();
        }
      }
    }

    // Return the result
    res.json({
      message: `Bet resolved! ${chosenLoser.name} ${chosenLoser.emoji} is the chosen loser!`,
      bet: {
        id: bet.id,
        title: bet.title,
        stake: bet.stake,
        winningOutcome: winningOutcome.label,
        status: bet.status,
        resolvedAt: bet.resolvedAt,
      },
      chosenLoser: {
        name: chosenLoser.name,
        emoji: chosenLoser.emoji,
        chore: bet.stake,
        confidence: chosenLoser.confidence,
        confidenceSlider: Math.round(chosenLoser.confidence / 10), // Convert back to 1-10
        selectedOutcome: chosenLoser.outcomeLabel,
        probabilityOfSelection: `${(chosenLoser.weight * 100).toFixed(1)}%`,
      },
      stats: {
        totalLosers: losers.length,
        totalWinners: winnersOutcome?.entries.length || 0,
        allLosersConfidence: losers.map((l) => ({
          name: l.name,
          emoji: l.emoji,
          confidence: l.confidence,
          confidenceSlider: Math.round(l.confidence / 10),
          selectionProbability: `${((l.confidence / totalConfidence) * 100).toFixed(1)}%`,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// ENTRIES ROUTES
// ============================================

/**
 * POST /api/entries
 * Create a new entry (user joins bet)
 * Body: { betId, userId, outcomeId, confidence }
 */
router.post('/entries', async (req, res, next) => {
  try {
    const { betId, userId, outcomeId, confidence } = req.body;

    if (!betId || !userId || !outcomeId || confidence === undefined) {
      return res.status(400).json({
        error: 'betId, userId, outcomeId, and confidence are required',
      });
    }

    // Verify bet exists
    const bet = await Bet.findByPk(betId);
    if (!bet) {
      return res.status(404).json({
        error: 'Bet not found',
      });
    }

    // Verify outcome exists
    const outcome = await Outcome.findByPk(outcomeId);
    if (!outcome) {
      return res.status(404).json({
        error: 'Outcome not found',
      });
    }

    const entry = await Entry.create({
      id: uuidv4(),
      betId,
      userId,
      outcomeId,
      confidence,
      result: 'pending',
    });

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/entries/:id
 * Update an entry (confidence, proof)
 * Body: { confidence, proofUrl, proofDescription }
 */
router.put('/entries/:id', async (req, res, next) => {
  try {
    const entry = await Entry.findByPk(req.params.id);

    if (!entry) {
      return res.status(404).json({
        error: 'Entry not found',
      });
    }

    const { confidence, proofUrl, proofDescription } = req.body;

    if (confidence !== undefined) entry.confidence = confidence;
    if (proofUrl) entry.proofUrl = proofUrl;
    if (proofDescription) entry.proofDescription = proofDescription;
    if (proofUrl || proofDescription) entry.proofSubmitted = true;

    await entry.save();
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/entries/:id/complete
 * Mark entry as completed with result
 * Body: { result }
 */
router.put('/entries/:id/complete', async (req, res, next) => {
  try {
    const { result } = req.body;

    if (!result || !['win', 'loss'].includes(result)) {
      return res.status(400).json({
        error: 'result must be "win" or "loss"',
      });
    }

    const entry = await Entry.findByPk(req.params.id);

    if (!entry) {
      return res.status(404).json({
        error: 'Entry not found',
      });
    }

    entry.result = result;
    entry.completedAt = new Date();
    await entry.save();

    // Update user stats
    const user = await User.findByPk(entry.userId);
    if (result === 'win') {
      user.wins += 1;
      user.streak += 1;
    } else {
      user.losses += 1;
      user.streak = 0;
    }
    await user.save();

    res.json({
      entry,
      userUpdated: user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/entries/:userId
 * Get all entries for a user
 */
router.get('/entries/:userId', async (req, res, next) => {
  try {
    const entries = await Entry.findAll({
      where: { userId: req.params.userId },
      include: [
        {
          model: Outcome,
        },
      ],
    });

    res.json(entries);
  } catch (error) {
    next(error);
  }
});

// ============================================
// FRIENDSHIP ROUTES
// ============================================

/**
 * POST /api/friends/add
 * Create a 'Following' relationship
 * Body: { userId, friendId }
 */
router.post('/friends/add', async (req, res, next) => {
  try {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res.status(400).json({
        error: 'userId and friendId are required',
      });
    }

    if (userId === friendId) {
      return res.status(400).json({
        error: 'cannot follow yourself',
      });
    }

    // Check if both users exist
    const user = await User.findByPk(userId);
    const friend = await User.findByPk(friendId);

    if (!user || !friend) {
      return res.status(404).json({
        error: 'one or both users not found',
      });
    }

    // Check if relationship already exists
    const existing = await Friendship.findOne({
      where: { userId, friendId },
    });

    if (existing) {
      return res.status(409).json({
        error: 'friendship relationship already exists',
      });
    }

    // Create friendship (following status)
    const friendship = await Friendship.create({
      id: uuidv4(),
      userId,
      friendId,
      status: 'following',
    });

    res.status(201).json(friendship);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/friends/accept
 * Update relationship to 'Mutual'
 * Body: { userId, friendId }
 */
router.post('/friends/accept', async (req, res, next) => {
  try {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res.status(400).json({
        error: 'userId and friendId are required',
      });
    }

    // Find the friendship where friendId is following userId
    const friendship = await Friendship.findOne({
      where: { userId: friendId, friendId: userId },
    });

    if (!friendship) {
      return res.status(404).json({
        error: 'friendship request not found',
      });
    }

    // Update to mutual
    friendship.status = 'mutual';
    await friendship.save();

    // Also create reverse mutual relationship if it doesn't exist
    const reverseRelationship = await Friendship.findOne({
      where: { userId, friendId },
    });

    if (!reverseRelationship) {
      await Friendship.create({
        id: uuidv4(),
        userId,
        friendId,
        status: 'mutual',
      });
    } else {
      reverseRelationship.status = 'mutual';
      await reverseRelationship.save();
    }

    res.json(friendship);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/friends/list/:userId
 * Return a list of mutual friends and followed users
 */
router.get('/friends/list/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'user not found',
      });
    }

    // Get all relationships where this user is following others
    const following = await Friendship.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'friend',
          attributes: { exclude: ['password'] },
        },
      ],
    });

    // Get all relationships where others are following this user
    const followers = await Friendship.findAll({
      where: { friendId: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] },
        },
      ],
    });

    // Format response
    const following_list = following.map((f) => ({
      id: f.id,
      user: f.friend,
      status: f.status,
      createdAt: f.createdAt,
    }));

    const followers_list = followers.map((f) => ({
      id: f.id,
      user: f.user,
      status: f.status,
      createdAt: f.createdAt,
    }));

    // Get mutual friends (both following each other)
    const mutual = following_list.filter((fItem) =>
      followers_list.some((follower) => follower.user.id === fItem.user.id)
    );

    res.json({
      userId,
      following: following_list,
      followers: followers_list,
      mutual: mutual,
      mutualCount: mutual.length,
      followingCount: following_list.length,
      followersCount: followers_list.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/friends/:id
 * Delete a friendship relationship
 */
router.delete('/friends/:id', async (req, res, next) => {
  try {
    const friendship = await Friendship.findByPk(req.params.id);

    if (!friendship) {
      return res.status(404).json({
        error: 'friendship not found',
      });
    }

    await friendship.destroy();
    res.json({ message: 'friendship deleted' });
  } catch (error) {
    next(error);
  }
});

// ============================================
// FEED ROUTES
// ============================================

/**
 * GET /api/feed/:userId
 * Fetch all active Bets from:
 * 1. Circles the user belongs to
 * 2. Public bets from users they follow
 * 
 * Returns bets sorted by deadline (soonest first)
 */
router.get('/feed/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'user not found',
      });
    }

    // Get all groups the user belongs to
    const userGroups = await GroupMember.findAll({
      where: { userId },
      attributes: ['groupId'],
    });

    const groupIds = userGroups.map((gm) => gm.groupId);

    // Get all users that this user is following
    const following = await Friendship.findAll({
      where: { userId },
      attributes: ['friendId'],
    });

    const followingUserIds = following.map((f) => f.friendId);

    // Query 1: Get active bets from user's circles
    const circleBets = await Bet.findAll({
      where: {
        groupId: groupIds.length > 0 ? groupIds : null,
        status: 'open',
      },
      include: [
        {
          model: Outcome,
          as: 'outcomes',
        },
        {
          model: User,
          as: 'creator',
          attributes: { exclude: ['password'] },
        },
        {
          model: Group,
          attributes: ['id', 'name', 'inviteCode'],
        },
      ],
      order: [['deadline', 'ASC']],
    });

    // Query 2: Get active public bets from users they follow
    // For now, we'll consider all bets as potentially public
    // In a production app, you'd add a "public" boolean field
    const followingBets = followingUserIds.length > 0
      ? await Bet.findAll({
          where: {
            createdBy: followingUserIds,
            status: 'open',
          },
          include: [
            {
              model: Outcome,
              as: 'outcomes',
            },
            {
              model: User,
              as: 'creator',
              attributes: { exclude: ['password'] },
            },
            {
              model: Group,
              attributes: ['id', 'name', 'inviteCode'],
            },
          ],
          order: [['deadline', 'ASC']],
        })
      : [];

    // Combine and deduplicate bets (in case a followed user is in the same circle)
    const betMap = new Map();
    [...circleBets, ...followingBets].forEach((bet) => {
      if (!betMap.has(bet.id)) {
        betMap.set(bet.id, bet);
      }
    });

    const allBets = Array.from(betMap.values()).sort(
      (a, b) => new Date(a.deadline) - new Date(b.deadline)
    );

    res.json({
      userId,
      betCount: allBets.length,
      circleCount: groupIds.length,
      followingCount: followingUserIds.length,
      bets: allBets,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
