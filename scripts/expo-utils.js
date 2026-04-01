const fs = require("fs");
const net = require("net");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const projectRoot = process.cwd();
const defaultPort = "8081";
const expoStateDir = path.join(projectRoot, ".expo");
const portStatePath = path.join(expoStateDir, "flowly-port.json");

function escapeForSingleQuotes(value) {
  return value.replace(/'/g, "''");
}

function sleep(timeoutMs) {
  return new Promise((resolve) => setTimeout(resolve, timeoutMs));
}

function stopExpoProcesses() {
  if (process.platform !== "win32") {
    return;
  }

  const command = `
    $projectRoot = '${escapeForSingleQuotes(projectRoot)}'
    $expoProcesses = Get-CimInstance Win32_Process | Where-Object {
      $_.Name -eq 'node.exe' -and
      $_.CommandLine -like '*expo\\bin\\cli*start*' -and
      $_.CommandLine -like "*$projectRoot*"
    }
    if ($expoProcesses) {
      $ids = $expoProcesses | Select-Object -ExpandProperty ProcessId
      Stop-Process -Id $ids -Force
      Write-Output ('Stopped Expo processes: ' + ($ids -join ', '))
    }
  `;

  spawnSync("powershell.exe", ["-NoProfile", "-Command", command], {
    stdio: "inherit",
  });
}

function getExpoCommand() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

function isPrivateIpv4(address) {
  return (
    address.startsWith("10.") ||
    address.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)
  );
}

function getPreferredLanIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const addresses of Object.values(interfaces)) {
    for (const addressInfo of addresses || []) {
      const family =
        typeof addressInfo.family === "string"
          ? addressInfo.family
          : addressInfo.family === 4
            ? "IPv4"
            : "";

      if (
        family === "IPv4" &&
        !addressInfo.internal &&
        isPrivateIpv4(addressInfo.address)
      ) {
        candidates.push(addressInfo.address);
      }
    }
  }

  return candidates[0] || null;
}

function spawnExpo(args, options = {}) {
  const env = {
    ...process.env,
    ...(options.env || {}),
  };

  if (process.platform === "win32") {
    return spawn(
      "cmd.exe",
      ["/c", getExpoCommand(), "expo", "start", ...args],
      {
        cwd: projectRoot,
        env,
        stdio: "inherit",
        shell: false,
      },
    );
  }

  return spawn(getExpoCommand(), ["expo", "start", ...args], {
    cwd: projectRoot,
    env,
    stdio: "inherit",
    shell: false,
  });
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => {
      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "127.0.0.1");
  });
}

async function findFreePort() {
  const preferredPorts = [8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088];

  for (const port of preferredPorts) {
    // eslint-disable-next-line no-await-in-loop
    if (await isPortOpen(port)) {
      return String(port);
    }
  }

  throw new Error("Could not find a free Expo port between 8081 and 8088.");
}

function saveLastPort(port) {
  fs.mkdirSync(expoStateDir, { recursive: true });
  fs.writeFileSync(portStatePath, JSON.stringify({ port }, null, 2));
}

function readLastPort() {
  if (!fs.existsSync(portStatePath)) {
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(portStatePath, "utf8"));
    return data.port ? String(data.port) : null;
  } catch (error) {
    return null;
  }
}

async function waitForManifest(port = defaultPort, timeoutMs = 90000) {
  const startedAt = Date.now();
  const manifestUrl = `http://127.0.0.1:${port}/?platform=ios`;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(manifestUrl, {
        headers: {
          accept: "application/expo+json,application/json,*/*",
        },
      });

      if (
        response.ok &&
        response.headers.get("content-type")?.includes("application/expo+json")
      ) {
        return response.json();
      }
    } catch (error) {
      // Expo is still starting up, so keep polling.
    }

    await sleep(1000);
  }

  throw new Error(
    `Expo did not become ready on port ${port} within ${timeoutMs / 1000}s.`,
  );
}

async function getExpoHostUri(
  port = readLastPort() || defaultPort,
  timeoutMs = 15000,
) {
  const manifest = await waitForManifest(port, timeoutMs);
  return manifest?.extra?.expoClient?.hostUri || null;
}

module.exports = {
  defaultPort,
  findFreePort,
  getPreferredLanIp,
  getExpoHostUri,
  readLastPort,
  saveLastPort,
  sleep,
  spawnExpo,
  stopExpoProcesses,
  waitForManifest,
};
