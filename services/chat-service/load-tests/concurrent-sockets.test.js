const { io } = require("socket.io-client");
const { performance } = require("perf_hooks");

const TOTAL_CLIENTS = 1000;
const BATCH_SIZE = 50;
const BATCH_INTERVAL_MS = 200;
const TEST_DURATION_MS = 30000;

const { generateTestToken } = require("./utils");

const SERVER_URL = "http://localhost:3200";
// Generate a valid token
const VALID_TOKEN = generateTestToken("load-test-user-main");

async function runConcurrentTest() {
  console.log(`Starting concurrent connection test`);
  console.log(`Target: ${TOTAL_CLIENTS} clients`);

  const clients = [];
  let connectedCount = 0;
  let errorCount = 0;

  const start = performance.now();

  for (let i = 0; i < TOTAL_CLIENTS; i += BATCH_SIZE) {
    const batchPromises = [];

    for (let j = 0; j < BATCH_SIZE && i + j < TOTAL_CLIENTS; j++) {
      batchPromises.push(
        new Promise((resolve) => {
          // Generate unique user ID for each connection to simulate real users
          // or reuse same user if testing per-user limits (but here we test concurrent connections)
          // Let's use unique users to avoid "same user connected elsewhere" logic issues if any
          const token = generateTestToken(`load-user-${i + j}`);

          const socket = io(SERVER_URL, {
            auth: { token },
            transports: ["websocket"],
            reconnection: false,
            forceNew: true,
          });

          socket.on("connect", () => {
            connectedCount++;
            resolve(socket);
          });

          socket.on("connect_error", (err) => {
            errorCount++;
            // console.error(`Connection error for client ${i+j}:`, err.message);
            socket.close();
            resolve(null);
          });
        }),
      );
    }

    const newSockets = await Promise.all(batchPromises);
    clients.push(...newSockets.filter((s) => s !== null));

    console.log(
      `Batch ${i / BATCH_SIZE + 1}: ${connectedCount} connected, ${errorCount} failed`,
    );
    await new Promise((r) => setTimeout(r, BATCH_INTERVAL_MS));
  }

  const connectTime = performance.now() - start;
  console.log(`\nConnection Phase Complete`);
  console.log(`Time taken: ${(connectTime / 1000).toFixed(2)}s`);
  console.log(`Connected: ${connectedCount}/${TOTAL_CLIENTS}`);
  console.log(`Failed: ${errorCount}/${TOTAL_CLIENTS}`);

  console.log(`\nHolding connections for ${TEST_DURATION_MS / 1000}s...`);
  await new Promise((r) => setTimeout(r, TEST_DURATION_MS));

  console.log("Disconnecting all clients...");
  clients.forEach((socket) => socket.close());
  console.log("Test complete.");
}

runConcurrentTest().catch(console.error);
