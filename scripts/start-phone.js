const {
  findFreePort,
  saveLastPort,
  sleep,
  spawnExpo,
  waitForManifest,
} = require("./expo-utils");

async function startPhoneSession() {
  const port = await findFreePort();

  if (port !== "8081") {
    throw new Error(
      "Phone tunnel needs port 8081. Run `npm run stop-expo` and make sure nothing else is using 8081, then try again.",
    );
  }

  saveLastPort(port);

  console.log("Starting Flowly for phone access through Expo tunnel...");
  console.log("Using Expo ws-tunnel to avoid the flaky ngrok path.");
  console.log(`Expo port: ${port}`);

  const expoProcess = spawnExpo(["--tunnel", "--go", "--port", port], {
    env: {
      EXPO_FORCE_WEBCONTAINER_ENV: "1",
    },
  });
  let expoClosed = false;
  let expoExitCode = 0;
  let startupFinished = false;

  expoProcess.on("close", (code) => {
    expoClosed = true;
    expoExitCode = code ?? 0;

    if (startupFinished) {
      process.exit(expoExitCode);
    }
  });

  try {
    let hostUri = null;
    const startedAt = Date.now();

    while (Date.now() - startedAt < 120000) {
      if (expoClosed) {
        throw new Error(
          "Expo tunnel closed before the public phone link was ready. Try `npm run local` on the same Wi-Fi or rerun `npm run phone` in a minute.",
        );
      }

      let manifest = null;

      try {
        // eslint-disable-next-line no-await-in-loop
        manifest = await waitForManifest(port, 5000);
      } catch (error) {
        manifest = null;
      }

      const currentHostUri = manifest?.extra?.expoClient?.hostUri;

      if (
        currentHostUri &&
        currentHostUri !== `127.0.0.1:${port}` &&
        currentHostUri !== `localhost:${port}`
      ) {
        hostUri = currentHostUri;
        break;
      }

      // eslint-disable-next-line no-await-in-loop
      await sleep(1000);
    }

    if (!hostUri) {
      throw new Error(
        "Expo tunnel started, but the public phone link was not ready in time. Try `npm run phone-link` after Metro finishes, or use `npm run local` on the same Wi-Fi.",
      );
    }

    console.log("");
    console.log("Phone link:");
    console.log(`exp://${hostUri}`);
    console.log("");
    console.log(
      "Open that link on your iPhone using Expo Go if QR scanning still fails.",
    );
  } catch (error) {
    console.error(error.message);
    console.log(
      "Tip: if your phone and laptop are on the same Wi-Fi, `npm run local` is usually the fastest fallback.",
    );
  } finally {
    startupFinished = true;

    if (expoClosed) {
      process.exit(expoExitCode);
    }
  }
}

startPhoneSession().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
