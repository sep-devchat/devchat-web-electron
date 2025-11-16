const openBrowserForLogin = require("./apis/openBrowserForLogin");
const showElectronApp = require("./apis/showElectronApp");
const showMessageNotification = require("./apis/showMessageNotification");

const nativeAPI = {
  openBrowserForLogin,
  showMessageNotification,
  showElectronApp,
};

module.exports = nativeAPI;
