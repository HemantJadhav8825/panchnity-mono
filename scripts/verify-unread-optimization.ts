
// Self-contained verification script
// Replicates the logic from ConversationService.listConversations to test the optimization
// without needing complex imports.

async function testOptimizationLogic() {
  console.log('Starting verification of Unread Count Logic...');

  // Mock Data Generators
  const createMockConv = (lastMessageAt: Date | undefined, lastReadAt: Date) => ({
    _id: 'conv1',
    lastMessageAt,
    participantSettings: [{ userId: 'user1', lastReadAt }],
  });

  // The Logic Function (Simulated)
  async function calculateUnread(conv: any, userId: string, mockCountDocs: () => Promise<number>) {
    const userSettings = conv.participantSettings?.find((p: any) => p.userId === userId);
    const lastReadAt = userSettings?.lastReadAt || new Date(0);
    
    let unreadCount = 0;

    // --- COPIED LOGIC START ---
    if (conv.lastMessageAt && new Date(conv.lastMessageAt) <= new Date(lastReadAt)) {
        unreadCount = 0;
    } else {
        const count = await mockCountDocs();
        unreadCount = Math.max(0, count);
    }
    // --- COPIED LOGIC END ---

    return unreadCount;
  }

  // TEST CASES

  // 1. Optimized Path: Read
  {
    console.log('\n--- Test 1: Optimizing Read Conversation ---');
    const now = new Date();
    const past = new Date(now.getTime() - 10000);
    const conv = createMockConv(past, now); // Msg 10s ago, Read now

    let dbCalled = false;
    const mockDb = async () => { dbCalled = true; return 999; };

    const count = await calculateUnread(conv, 'user1', mockDb);
    
    if (count === 0 && !dbCalled) {
        console.log('✅ PASS: DB query skipped for read conversation.');
    } else {
        console.error('❌ FAIL: Logic failed.', { count, dbCalled });
        process.exit(1);
    }
  }

  // 2. Standard Path: Unread
  {
    console.log('\n--- Test 2: Standard Unread Conversation ---');
    const now = new Date();
    const past = new Date(now.getTime() - 10000);
    const conv = createMockConv(now, past); // Msg now, Read 10s ago

    let dbCalled = false;
    const mockDb = async () => { dbCalled = true; return 5; };

    const count = await calculateUnread(conv, 'user1', mockDb);

    if (count === 5 && dbCalled) {
        console.log('✅ PASS: DB query performed for unread conversation.');
    } else {
        console.error('❌ FAIL: Logic failed.', { count, dbCalled });
        process.exit(1);
    }
  }

  // 3. Safeguard: Negative Count
  {
    console.log('\n--- Test 3: Negative Count Safeguard ---');
    const now = new Date();
    const past = new Date(now.getTime() - 10000);
    const conv = createMockConv(now, past); // Unread path

    let dbCalled = false;
    const mockDb = async () => { dbCalled = true; return -5; }; // DB returns negative

    const count = await calculateUnread(conv, 'user1', mockDb);

    if (count === 0 && dbCalled) {
        console.log('✅ PASS: Neagtive count corrected to 0.');
    } else {
        console.error('❌ FAIL: Safeguard failed.', { count });
        process.exit(1);
    }
  }

  console.log('\n✅ ALL TESTS PASSED');
}

testOptimizationLogic().catch(e => {
    console.error(e);
    process.exit(1);
});
