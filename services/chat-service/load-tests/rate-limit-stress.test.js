const { io } = require("socket.io-client");
const { performance } = require("perf_hooks");
const { generateTestToken } = require("./utils");

const USER_ID = "test-user-rate-limit"; // Mock user ID
const CONVERSATION_ID = "rate-limit-conv-123";
const SERVER_URL = "http://localhost:3200";

// Expected limits from guardrails.ts:
// User limit: 5 msg / 10s
// Conversation limit: 10 msg / 10s

async function runRateLimitTest() {
  console.log(`Starting Rate Limit Stress Test`);

  const token = generateTestToken(USER_ID);
  const socket = io(SERVER_URL, {
    auth: { token },
    transports: ["websocket"],
    forceNew: true,
  });

  await new Promise((resolve) => socket.on("connect", resolve));
  console.log("Connected to server.");

  let sent = 0;
  let allowed = 0;
  let blocked = 0;
  const attempted = 15; // Try to send more than limit (10)

  console.log(`Attempting to send ${attempted} messages rapidly...`);

  for (let i = 0; i < attempted; i++) {
    const payload = {
      conversationId: CONVERSATION_ID,
      content: `Rate limit test message ${i}`,
      clientMessageId: `rl-${i}-${Date.now()}`,
    };

    // We need to listen to socket events to know if it failed, but the current implementation
    // throws Error in service which might return an error ack or socket error event.
    // Based on `message:send` handler in `socket.ts` (not fully visible but implied),
    // it usually returns an ack with error if service throws.

    // Note: The message service throws Error. The socket handler usually catches it.
    // We assume the socket handler calls the ack with { error: "..." }.

    try {
      const response = await fetch(`${SERVER_URL}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      sent++;
      if (response.status === 429) {
        // Too Many Requests
        console.log(`Message ${i} blocked: 429 Too Many Requests`);
        blocked++;
      } else if (!response.ok) {
        console.log(`Message ${i} failed: ${response.status}`);
        // Treat other errors as blocked if related to Guardrails (e.g. 400 Bad Request with specific message)
        const data = await response.json();
        if (data.error && data.error.includes("Too many messages")) {
          blocked++;
        } else {
          // Maybe legitimate failure
        }
      } else {
        console.log(`Message ${i} allowed`);
        allowed++;
      }
    } catch (err) {
      console.log(`Message ${i} network error: ${err.message}`);
    }

    // Small delay to ensure order but fast enough to hit rate limit
    await new Promise((r) => setTimeout(r, 100));
  }

  // No need to wait for socket acks
  // await new Promise(r => setTimeout(r, 2000));

  console.log(`\nRate Limit Results:`);
  console.log(`Total Attempted: ${attempted}`);
  console.log(`Allowed: ${allowed}`);
  console.log(`Blocked: ${blocked}`);

  // Verification logic
  if (allowed <= 10 && blocked > 0) {
    console.log("✅ Rate limiting is working (traffic blocked after limit)");
  } else {
    console.log(
      "❌ Rate limiting FAILED (traffic not blocked or limit too high)",
    );
  }

  socket.close();
}

runRateLimitTest().catch(console.error);
