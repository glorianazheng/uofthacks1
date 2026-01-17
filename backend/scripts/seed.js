import { sequelize, User, Group, GroupMember, Bet, Outcome, Entry } from '../database.js';

async function seed() {
  try {
    console.log('🌱 Seeding database...');
    
    // Truncate existing data
    await sequelize.truncate({ cascade: true });
    console.log('✅ Cleared existing data');

    // Create users
    const jay = await User.create({
      id: 'user-1',
      name: 'Jay',
      emoji: '🤴',
      wins: 5,
      losses: 2,
      streak: 3,
    });

    const eva = await User.create({
      id: 'user-2',
      name: 'Eva',
      emoji: '🎭',
      wins: 8,
      losses: 3,
      streak: 2,
    });

    const alex = await User.create({
      id: 'user-3',
      name: 'Alex',
      emoji: '⚽',
      wins: 4,
      losses: 5,
      streak: 0,
    });

    const sam = await User.create({
      id: 'user-4',
      name: 'Sam',
      emoji: '🎨',
      wins: 6,
      losses: 1,
      streak: 4,
    });

    console.log('✅ Created 4 users');

    // Create groups
    const group1 = await Group.create({
      id: 'group-1',
      name: 'The Squad',
      createdBy: jay.id,
      inviteCode: 'SQUAD1',
    });

    const group2 = await Group.create({
      id: 'group-2',
      name: 'Entertainment Crew',
      createdBy: eva.id,
      inviteCode: 'ENTRT2',
    });

    console.log('✅ Created 2 groups');

    // Add members to groups
    await GroupMember.create({ userId: jay.id, groupId: group1.id });
    await GroupMember.create({ userId: eva.id, groupId: group1.id });
    await GroupMember.create({ userId: alex.id, groupId: group1.id });
    await GroupMember.create({ userId: sam.id, groupId: group1.id });

    await GroupMember.create({ userId: eva.id, groupId: group2.id });
    await GroupMember.create({ userId: alex.id, groupId: group2.id });

    console.log('✅ Added members to groups');

    // Create bets
    const bet1 = await Bet.create({
      id: 'bet-1',
      groupId: group1.id,
      title: 'Will Raptors beat Celtics?',
      category: 'sports',
      status: 'open',
      createdBy: jay.id,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      stake: 'Buy coffee ☕',
    });

    const bet2 = await Bet.create({
      id: 'bet-2',
      groupId: group2.id,
      title: 'Will there be a shocking moment in tonight\'s episode?',
      category: 'entertainment',
      status: 'locked',
      createdBy: eva.id,
      deadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
      stake: 'Do dishes 🍽️',
    });

    const bet3 = await Bet.create({
      id: 'bet-3',
      groupId: group2.id,
      title: 'Will it rain tomorrow in Toronto?',
      category: 'weather',
      status: 'open',
      createdBy: eva.id,
      deadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
      stake: 'Buy lunch 🍕',
    });

    console.log('✅ Created 3 bets');

    // Create outcomes for bet1
    const bet1_outcome1 = await Outcome.create({
      id: 'outcome-1',
      betId: bet1.id,
      label: 'Raptors Win',
      weight: 6,
    });

    const bet1_outcome2 = await Outcome.create({
      id: 'outcome-2',
      betId: bet1.id,
      label: 'Celtics Win',
      weight: 4,
    });

    // Create outcomes for bet2
    const bet2_outcome1 = await Outcome.create({
      id: 'outcome-3',
      betId: bet2.id,
      label: 'Yes, Very Shocking',
      weight: 7,
    });

    const bet2_outcome2 = await Outcome.create({
      id: 'outcome-4',
      betId: bet2.id,
      label: 'Nope, Predictable',
      weight: 3,
    });

    // Create outcomes for bet3
    const bet3_outcome1 = await Outcome.create({
      id: 'outcome-5',
      betId: bet3.id,
      label: 'Yes, Rain Expected',
      weight: 5,
    });

    const bet3_outcome2 = await Outcome.create({
      id: 'outcome-6',
      betId: bet3.id,
      label: 'No, Sunny Day',
      weight: 5,
    });

    console.log('✅ Created 6 outcomes');

    // Create entries (user bets)
    const entry1 = await Entry.create({
      id: 'entry-1',
      betId: bet1.id,
      userId: jay.id,
      outcomeId: bet1_outcome1.id,
      confidence: 85,
      result: 'pending',
    });

    const entry2 = await Entry.create({
      id: 'entry-2',
      betId: bet1.id,
      userId: eva.id,
      outcomeId: bet1_outcome2.id,
      confidence: 70,
      result: 'pending',
    });

    const entry3 = await Entry.create({
      id: 'entry-3',
      betId: bet1.id,
      userId: alex.id,
      outcomeId: bet1_outcome1.id,
      confidence: 60,
      result: 'pending',
    });

    const entry4 = await Entry.create({
      id: 'entry-4',
      betId: bet2.id,
      userId: eva.id,
      outcomeId: bet2_outcome1.id,
      confidence: 90,
      result: 'pending',
    });

    const entry5 = await Entry.create({
      id: 'entry-5',
      betId: bet2.id,
      userId: alex.id,
      outcomeId: bet2_outcome2.id,
      confidence: 75,
      result: 'pending',
    });

    const entry6 = await Entry.create({
      id: 'entry-6',
      betId: bet3.id,
      userId: eva.id,
      outcomeId: bet3_outcome1.id,
      confidence: 55,
      result: 'pending',
    });

    const entry7 = await Entry.create({
      id: 'entry-7',
      betId: bet3.id,
      userId: sam.id,
      outcomeId: bet3_outcome2.id,
      confidence: 80,
      result: 'pending',
    });

    console.log('✅ Created 7 entries');

    console.log('\n📊 Seed Summary:');
    console.log('  Users: 4 (Jay, Eva, Alex, Sam)');
    console.log('  Groups: 2 (The Squad, Entertainment Crew)');
    console.log('  Bets: 3 (Sports, Entertainment, Weather)');
    console.log('  Outcomes: 6 (2 per bet)');
    console.log('  Entries: 7 (User predictions)');
    console.log('\n✨ Database seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
