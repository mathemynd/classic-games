export default [
  {
    languageOptions: {
      globals: {
        document: "readonly",
        console: "readonly",
        Set: "readonly",
        Array: "readonly",
        Math: "readonly",
        // Cross-file globals (multi-script setup, no module system)
        gameSelectScreen: "readonly",
        classicScreen: "readonly",
        ultimateScreen: "readonly",
        weirdScreen: "readonly",
        initClassicGame: "readonly",
        initUltimateGame: "readonly",
        initWeirdGame: "readonly",
        resetClassicGame: "readonly",
        resetUltimateGame: "readonly",
        resetWeirdGame: "readonly",
        ultimateWinPatterns: "readonly",
      },
    },
    rules: {
      complexity: ["warn", 5],
      "no-unused-vars": "warn",
      "no-undef": "warn",
      eqeqeq: "warn",
      "no-duplicate-case": "error",
      "no-fallthrough": "warn",
      "no-redeclare": "warn",
      "no-shadow": "warn",
      "no-use-before-define": ["warn", { functions: false }],
    },
  },
];
