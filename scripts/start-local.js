const {
  findFreePort,
  getPreferredLanIp,
  saveLastPort,
  spawnExpo,
} = require("./expo-utils");

async function startLocalSession() {
  const port = await findFreePort();
  saveLastPort(port);

  console.log("Starting Flowly for local network access...");
  console.log(`Expo port: ${port}`);
  console.log(
    "Use Expo Go on the same Wi-Fi network, or switch to `npm run phone` if local access fails.",
  );

  const lanIp = getPreferredLanIp();

  if (lanIp) {
    console.log(`Using laptop LAN IP: ${lanIp}`);
  } else {
    console.log(
      "Could not detect a private LAN IP automatically. Expo may fall back to localhost.",
    );
  }

  const expoProcess = spawnExpo(["--lan", "--go", "--port", port], {
    env: lanIp
      ? {
          REACT_NATIVE_PACKAGER_HOSTNAME: lanIp,
        }
      : undefined,
  });

  expoProcess.on("close", (code) => {
    process.exit(code ?? 0);
  });
}

startLocalSession().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
