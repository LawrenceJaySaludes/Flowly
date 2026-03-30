const {
  findFreePort,
  saveLastPort,
  spawnExpo,
  waitForManifest,
} = require("./expo-utils");

async function startPhoneSession() {
  const port = await findFreePort();
  saveLastPort(port);

  console.log("Starting Flowly for phone access through Expo tunnel...");
  console.log(`Expo port: ${port}`);

  const expoProcess = spawnExpo(["--tunnel", "--go", "--clear", "--port", port]);

  expoProcess.on("close", (code) => {
    process.exit(code ?? 0);
  });

  try {
    let hostUri = null;
    const startedAt = Date.now();

    while (Date.now() - startedAt < 120000) {
      // eslint-disable-next-line no-await-in-loop
      const manifest = await waitForManifest(port, 5000);
      const currentHostUri = manifest?.extra?.expoClient?.hostUri;

      if (currentHostUri && currentHostUri !== `127.0.0.1:${port}` && currentHostUri !== `localhost:${port}`) {
        hostUri = currentHostUri;
        break;
      }
    }

    if (!hostUri) {
      throw new Error("Expo tunnel started, but the public phone link was not ready in time.");
    }

    console.log("");
    console.log("Phone link:");
    console.log(`exp://${hostUri}`);
    console.log("");
    console.log("Open that link on your iPhone using Expo Go if QR scanning still fails.");
  } catch (error) {
    console.error(error.message);
  }
}

startPhoneSession();
