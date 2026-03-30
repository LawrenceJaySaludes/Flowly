const fs = require("fs");
const net = require("net");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const projectRoot = process.cwd();
const defaultPort = "8081";
const expoStateDir = path.join(projectRoot, ".expo");
const portStatePath = path.join(expoStateDir, "flowly-port.json");

function escapeForSingleQuotes(value) {
  return value.replace(/'/g, "''");
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

function spawnExpo(args) {
  if (process.platform === "win32") {
    return spawn("cmd.exe", ["/c", getExpoCommand(), "expo", "start", ...args], {
      cwd: projectRoot,
      stdio: "inherit",
      shell: false,
    });
  }

  return spawn(getExpoCommand(), ["expo", "start", ...args], {
    cwd: projectRoot,
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

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}`);

      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      // Expo is still starting up, so keep polling.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Expo did not become ready on port ${port} within ${timeoutMs / 1000}s.`);
}

async function getExpoHostUri(port = readLastPort() || defaultPort, timeoutMs = 15000) {
  const manifest = await waitForManifest(port, timeoutMs);
  return manifest?.extra?.expoClient?.hostUri || null;
}

module.exports = {
  defaultPort,
  findFreePort,
  getExpoHostUri,
  readLastPort,
  saveLastPort,
  spawnExpo,
  stopExpoProcesses,
  waitForManifest,
};
