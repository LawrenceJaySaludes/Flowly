const { defaultPort, getExpoHostUri, readLastPort } = require("./expo-utils");

const port = process.env.EXPO_PORT || process.argv[2] || readLastPort() || defaultPort;

async function printExpoLink() {
  const hostUri = await getExpoHostUri(port);

  if (!hostUri) {
    throw new Error("Could not find Expo Go hostUri. Start Expo with `npm run tunnel` first.");
  }

  console.log(`Open this on your phone: exp://${hostUri}`);
}

printExpoLink().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
