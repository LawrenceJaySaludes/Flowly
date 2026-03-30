const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const { defaultPort, getExpoHostUri, readLastPort } = require("./expo-utils");

const port = process.env.EXPO_PORT || process.argv[2] || readLastPort() || defaultPort;

async function generatePhoneQrPage() {
  const hostUri = await getExpoHostUri(port);

  if (!hostUri) {
    throw new Error("Could not find Expo Go hostUri. Start Expo with `npm run phone` first.");
  }

  const expoLink = `exp://${hostUri}`;
  const qrDataUrl = await QRCode.toDataURL(expoLink, {
    errorCorrectionLevel: "H",
    margin: 2,
    scale: 10,
  });

  const outputDir = path.join(process.cwd(), ".expo");
  const outputPath = path.join(outputDir, "phone-qr.html");

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    outputPath,
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Flowly Phone QR</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: #f7f9fc;
        color: #111827;
      }
      .wrap {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px 16px;
      }
      .card {
        width: min(92vw, 560px);
        background: #ffffff;
        border-radius: 24px;
        box-shadow: 0 18px 40px rgba(17, 24, 39, 0.08);
        padding: 28px;
        text-align: center;
      }
      img {
        width: min(78vw, 360px);
        height: auto;
        display: block;
        margin: 24px auto;
      }
      code {
        word-break: break-all;
        display: block;
        background: #f7f9fc;
        border-radius: 12px;
        padding: 12px;
        margin-top: 14px;
      }
      .hint {
        color: #6b7280;
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>Flowly Expo Go Access</h1>
        <p class="hint">On iPhone, scan this QR with the Camera app. If scanning still fails, send the link below to your phone and tap it to open in Expo Go.</p>
        <img src="${qrDataUrl}" alt="Expo Go QR code" />
        <code>${expoLink}</code>
      </div>
    </div>
  </body>
</html>`,
    "utf8"
  );

  console.log(`QR page created: ${outputPath}`);
  console.log(`Expo Go link: ${expoLink}`);
}

generatePhoneQrPage().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
