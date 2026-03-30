const { findFreePort, saveLastPort, spawnExpo } = require("./expo-utils");

async function startLocalSession() {
  const port = await findFreePort();
  saveLastPort(port);

  console.log("Starting Flowly for local network access...");
  console.log(`Expo port: ${port}`);
  console.log("Use Expo Go on the same Wi-Fi network, or switch to `npm run phone` if local access fails.");

  const expoProcess = spawnExpo(["--lan", "--go", "--clear", "--port", port]);

  expoProcess.on("close", (code) => {
    process.exit(code ?? 0);
  });
}

startLocalSession().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
