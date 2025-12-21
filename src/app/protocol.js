const { app } = require("electron");
const path = require("path");
const { getMainWindow, setPendingDeepLink } = require("./state");

const SCHEME = "devchat";

function registerProtocol() {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(SCHEME, process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    }
  } else {
    app.setAsDefaultProtocolClient(SCHEME);
  }
}

function parseDeepLink(url) {
  let code = "";
  let pathName = "";
  const searchParams = {};
  try {
    const u = new URL(url);
    if (u.protocol.replace(/:$/, "") === SCHEME) {
      code = u.searchParams.get("code") ?? "";
        pathName = u.pathname || "";
        u.searchParams.forEach((value, key) => {
          searchParams[key] = value;
        });
    }
  } catch (err) {
    console.warn("Failed to parse deep link", url, err);
  }
    return { url, code, path: pathName, searchParams };
}

function focusAndSend(win, payload) {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
  win.webContents.send("deep-link", payload);
}

function onDeepLink(url) {
  const payload = parseDeepLink(url);
  const win = getMainWindow();
  if (win) {
    focusAndSend(win, payload);
  } else {
    setPendingDeepLink(payload);
  }
}

function ensureSingleInstance() {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
    return;
  }

  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance; focus our window.
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
    // The commandLine is array of strings in which last element might be deep link url
    const maybeUrl = commandLine[commandLine.length - 1];
    if (maybeUrl) onDeepLink(maybeUrl);
  });
}
// Handle initial deep link passed via argv when app starts from a URL (Windows/Linux)
function maybeHandleInitialDeepLink(argv = process.argv) {
  if (!Array.isArray(argv) || argv.length === 0) return;
  // Commonly the last arg is the URL when launched from protocol
  const candidate = argv[argv.length - 1];
  if (typeof candidate === "string" && candidate.startsWith(`${SCHEME}://`)) {
    onDeepLink(candidate);
  }
}

module.exports = {
  registerProtocol,
  parseDeepLink,
  onDeepLink,
  ensureSingleInstance,
  maybeHandleInitialDeepLink,
};
