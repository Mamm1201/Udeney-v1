const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: "./src/index.jsx", // Punto de entrada del frontend
  output: {
    path: path.resolve(__dirname, "build"), // Carpeta donde se guardará el frontend compilado
    filename: "bundle.js",
    publicPath: "/", // Ruta base para React Router
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Archivos JS/JSX
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/, // Manejo de imágenes
        use: ["file-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"], // Permite importar archivos sin escribir su extensión
  },
  plugins: [
    new CleanWebpackPlugin(), // Limpia la carpeta "build" antes de cada build
    new HtmlWebpackPlugin({
      template: "./public/index.html", // Plantilla HTML base
      filename: "index.html",
    }),
  ],
};
