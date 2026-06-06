const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const domExceptionShim = path.resolve(__dirname, "src/polyfills/DOMException.js");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isReactNativeDOMException =
    moduleName === "../errors/DOMException" &&
    context.originModulePath.includes("react-native/src/private/webapis/");

  if (isReactNativeDOMException) {
    return { filePath: domExceptionShim, type: "sourceFile" };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
