# Flowly

Expo React Native mobile app starter for a personal finance app using JavaScript and NativeWind.

## Install dependencies

```bash
npm install
```

## Run the mobile app

```bash
npm start
```

`npm start` now starts a clean local-network Expo session for mobile development.

Use these helpers:

```bash
npm run local
npm run phone
npm run phone-link
npm run phone-qr
npm run web
npm run stop-expo
npm run android
npm run ios
```

- `npm run local`: start for phone access on the same Wi-Fi network
- `npm run phone`: start a clean Expo tunnel session and print a direct `exp://...` phone link
- `npm run phone-link`: print the direct Expo Go link for the currently running session
- `npm run phone-qr`: generate a large QR page at `.expo/phone-qr.html` for iPhone Camera scanning
- `npm run web`: open a browser preview of the same app on localhost
- `npm run stop-expo`: stop older Flowly Expo sessions if ports get stuck

The local and phone helpers automatically choose an open Expo port, so they avoid the usual `8081 already in use` prompt.

## Browser preview

Run:

```bash
npm run web
```

This opens Flowly in a local browser preview for faster UI checks. Keep using Expo Go for real mobile testing, since the browser preview is only a convenience layer on top of the mobile app.

## Test on your phone with Expo Go

1. Install Expo Go on your phone from the App Store or Google Play.
2. Make sure your phone and computer are on the same Wi-Fi network.
3. Start the project with `npm run local`.
4. Scan the QR code:
   - iPhone: use the Camera app.
   - Android: scan inside Expo Go.

If the QR code does not connect on your network, run `npm run phone` and use the printed `exp://...` link in Expo Go.

## iPhone QR troubleshooting

If your iPhone Camera says `No usable data found`, the QR image usually is not being read correctly rather than the app being broken. Try this:

1. Use `npm run phone` instead of `npm start`.
2. Open Expo Go on the iPhone and use its built-in QR scanner instead of the Camera app.
3. Keep the QR fully visible on your computer screen and increase zoom or terminal font size.
4. Make sure you are scanning the QR from your computer screen, not from a screenshot on the same phone.
5. If Expo says a port like `8081` is already in use, run `npm run stop-expo`, then start again.
6. If scanning still fails, keep Expo running and use `npm run phone-link` to print a direct `exp://...` link you can open on the phone.
7. If the terminal QR is too small, run `npm run phone-qr`, open `.expo/phone-qr.html` on your computer, and scan that larger QR with the iPhone Camera app.
