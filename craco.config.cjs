const { writeFileSync, readFile, readFileSync } = require("fs");
const webpack = require("webpack");
const exec = require("child_process").execSync;
require("dotenv/config");

module.exports = {
  plugins: [],
  devServer: {
    proxy: {
      "/plugin/": {
        target: process.env.REACT_APP_SERVER ?? "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
  webpack: {
    configure: (config) => {
      const fallback = config.resolve.fallback || {};
      Object.assign(fallback, {
        crypto: "crypto-browserify",
        stream: "stream-browserify",
        fs: false,
      });
      const envs = Object.keys(process.env).reduce((ret, envKey) => {
        if (envKey.indexOf("REACT_APP_") === 0) {
          const val = process.env[envKey];
          return {
            ...ret,
            [`process.env.${envKey}`]: val,
            [envKey]: val,
          };
        } else {
          return ret;
        }
      }, {});
      config.resolve.fallback = fallback;
      config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
          // process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
        new webpack.DefinePlugin(envs),
        {
          apply: (compiler) => {
            compiler.hooks.afterEmit.tap("AfterEmitPlugin", () => {
              try {
                const backgroundScript = "./build/scripts/background.js";
                const backgroundProcessContent = readFileSync(backgroundScript);
                writeFileSync(
                  backgroundScript,
                  `console.log(${JSON.stringify(envs)}); window.process = {
                    env: ${JSON.stringify(envs)}
                  };
                  ${backgroundProcessContent}`
                );
                const contentScript = "./build/content.js";
                const contentProcessContent = readFileSync(contentScript);
                writeFileSync(
                  contentScript,
                  `window.process = {
                    env: ${JSON.stringify(envs)}
                  };
                  ${contentProcessContent}`
                );
                exec("./bin/bundle-copy.sh");
              } catch (e) {
                console.error(e);
              }
            });
          },
        },
      ]);
      config.module.rules.unshift({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      });
      config.ignoreWarnings = [/Failed to parse source map/];
      return config;
    },
  },
};
