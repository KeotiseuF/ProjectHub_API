import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  {
    rules: {
      "prefer-const": "warn",
      "no-constant-binary-expression": "error",
      "no-constant-condition": "error",
      "no-const-assign": "error"
    }
  }
];