const { defaultPort, getExpoHostUri, readLastPort } = require("./expo-utils");

const port =
  process.env.EXPO_PORT || process.argv[2] || readLastPort() || defaultPort;
const manifestTimeoutMs = 120000;

async function printExpoLink() {
  const hostUri = await getExpoHostUri(port, manifestTimeoutMs);

  if (!hostUri) {
    throw new Error(
      "Could not find Expo Go hostUri yet. Make sure Expo is still starting, then try `npm run phone-link` again in a few seconds.",
    );
  }

  console.log(`Open this on your phone: exp://${hostUri}`);
}

printExpoLink().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
