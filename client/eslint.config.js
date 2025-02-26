import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect", // 🔹 Detecta automáticamente la versión de React
      },
    },
    languageOptions: { globals: globals.node }, // 🔹 Agrega soporte para Node.js
    rules: {
      "react/react-in-jsx-scope": "off", // 🔹 Desactiva la necesidad de importar React en cada archivo JSX
      "react/prop-types": "off", // 🔹 Desactiva la validación de PropTypes
      "no-unused-vars": ["warn", { varsIgnorePattern: "^_" }], // 🔹 Ignora variables sin usar que comiencen con "_"
    },
  },
];
