import babel from "prettier/plugins/babel";
import estree from "prettier/plugins/estree";
import typescript from "prettier/plugins/typescript";
import glimmer from "prettier/plugins/glimmer";
import html from "prettier/plugins/html";
import markdown from "prettier/plugins/markdown";
import postcss from "prettier/plugins/postcss";
import yaml from "prettier/plugins/yaml";
import angular from "prettier/plugins/angular";

export const PRETTIER_CONFIG_DOCS = "https://prettier.io/docs/en/options.html";

export const prettierPlugins = [
  babel,
  estree,
  typescript,
  glimmer,
  html,
  markdown,
  postcss,
  yaml,
  angular,
];

export const CODEBLOCK_REGEX = /```(.+?)\n(.+?)```/g;

export const defaultSettings = {
  autoFormat: true,
  formatOnSend: false,
  prettier: {
    singleQuote: false,
    bracketSpacing: true,
    bracketSameLine: false,
    htmlWhitespaceSensitivity: "css",
    singleAttributePerLine: false,
    vueIndentScriptAndStyle: false,
    arrowParens: "always",
    semi: true,
    jsxSingleQuote: false,
    quoteProps: "as-needed",
    trailingComma: "all",
    proseWrap: "preserve",
    tabWidth: 2,
    embeddedLanguageFormatting: "auto",
  },
};
