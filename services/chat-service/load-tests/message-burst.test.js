const { io } = require("socket.io-client");
const { performance } = require("perf_hooks");
const { generateTestToken } = require("./utils");
// Node 18+ has native fetch, so no import needed for 'node-fetch'

const SENDER_COUNT = 10;
const MESSAGES_PER_SENDER = 50;
const MESSAGE_INTERVAL_MS = 100; // 10 messages/sec per sender = 100 total msg/sec
const SERVER_URL = "http://localhost:3200";
const TEST_CONVERSATION_ID = "65c1234567890abcdef12345"; // Needs to be a valid ID or mock

async function runMessageBurstTest() {
  console.log(`Starting message burst test`);
  console.log(
    `Senders: ${SENDER_COUNT}, Messages each: ${MESSAGES_PER_SENDER}`,
  );
  console.log(
    `Target Rate: ~${SENDER_COUNT * (1000 / MESSAGE_INTERVAL_MS)} msg/sec`,
  );

  const sockets = [];

  // Setup clients
  for (let i = 0; i < SENDER_COUNT; i++) {
    const token = generateTestToken(`burst-sender-${i}`);
    const socket = io(SERVER_URL, {
      auth: { token },
      transports: ["websocket"],
      forceNew: true,
    });
    // Store token on socket object for reuse in loop
    socket.auth = { token };
    sockets.push(socket);
  }

  // Wait for connections
  await Promise.all(
    sockets.map((s) => new Promise((resolve) => s.on("connect", resolve))),
  );
  console.log("All senders connected.");

  let sentCount = 0;
  let ackCount = 0;
  let errorCount = 0;

  const start = performance.now();

  // Start sending burst
  const sendPromises = sockets.map((socket, index) => {
    return new Promise(async (resolve) => {
      for (let j = 0; j < MESSAGES_PER_SENDER; j++) {
        const payload = {
          conversationId: TEST_CONVERSATION_ID,
          content: `Test message ${j} from sender ${index} - ${Date.now()}`,
          clientMessageId: `load-test-${index}-${j}-${Date.now()}`,
        };

        try {
          const response = await fetch(`${SERVER_URL}/v1/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sockets[index].auth.token}`, // Reuse token from socket object
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            ackCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }

        sentCount++;
        await new Promise((r) => setTimeout(r, MESSAGE_INTERVAL_MS));
      }
      resolve();
    });
  });

  await Promise.all(sendPromises);

  const end = performance.now();
  const duration = (end - start) / 1000;

  console.log(`\nTest Complete`);
  console.log(`Duration: ${duration.toFixed(2)}s`);
  console.log(`Total Sent: ${sentCount}`);
  console.log(`Acknowledged: ${ackCount}`);
  console.log(`Errors (Rate Limits/Failures): ${errorCount}`);
  console.log(`Effective Rate: ${(sentCount / duration).toFixed(2)} msg/sec`);

  sockets.forEach((s) => s.close());
}

runMessageBurstTest().catch(console.error);
