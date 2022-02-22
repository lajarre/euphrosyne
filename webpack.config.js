import path from "path";
import glob from "glob";
import { fileURLToPath } from "url";
import { dirname } from "path";

import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

export default {
  entry: {
    main: [
      "promise-polyfill/src/polyfill",
      "whatwg-fetch",
      "./euphrosyne/assets/css/base.css",
    ],
    "dsfr-style": [
      "@gouvfr/dsfr/dist/core/core.min.css",
      "@gouvfr/dsfr/dist/component/link/link.min.css",
      "@gouvfr/dsfr/dist/component/button/button.min.css",
      "@gouvfr/dsfr/dist/component/tag/tag.min.css",
      "@gouvfr/dsfr/dist/component/accordion/accordion.min.css",
    ],
    "dsfr-module": [
      "@gouvfr/dsfr/dist/core/core.module.min.js",
      "@gouvfr/dsfr/dist/component/accordion/accordion.module.min.js",
    ],
    "dsfr-no-module": [
      "@gouvfr/dsfr/dist/legacy/legacy.nomodule.min.js",
      "@gouvfr/dsfr/dist/core/core.nomodule.min.js",
      "@gouvfr/dsfr/dist/component/accordion/accordion.nomodule.min.js",
    ],
    ...Object.assign(
      {},
      ...glob.sync("./**/assets/js/pages/*.js").map((file) => {
        return {
          [file.split("/").pop().split(".").shift()]: {
            import: file,
            filename: "./pages/[name].js",
          },
        };
      })
    ),
  },
  output: {
    path: path.resolve(
      dirname(fileURLToPath(import.meta.url)),
      "euphrosyne/assets/dist"
    ),
    publicPath: "/static/",
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(woff(2)?|ttf|eot)$/,
        type: "asset/resource",
        generator: {
          filename: "./fonts/[name][ext]",
        },
      },
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
    ],
  },
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
  },
  plugins: [new MiniCssExtractPlugin()],
};
