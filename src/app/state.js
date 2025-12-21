const { createWindow } = require("./window");

let mainWindow = null;
let pendingDeepLink = null; // { url, code, path, searchParams }
let forceQuit = false;

function setMainWindow(win) {
  mainWindow = win;
  // Flush pending deep link once window is available
  if (pendingDeepLink && mainWindow) {
    try {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      mainWindow.webContents.send("deep-link", pendingDeepLink);
      pendingDeepLink = null;
    } catch (err) {
      // keep it for later if something goes wrong
      console.warn("Failed to deliver pending deep link:", err);
    }
  }
}

function getMainWindow() {
  return mainWindow;
}

function createMainWindow() {
  return createWindow();
}

function setPendingDeepLink(payload) {
  pendingDeepLink = payload;
}

module.exports = {
  setMainWindow,
  getMainWindow,
  createMainWindow,
  setPendingDeepLink,
  // quit control flag
  setForceQuit(value) { forceQuit = !!value; },
  getForceQuit() { return forceQuit; },
};
