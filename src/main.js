import { startRepl } from "./repl.js";

import { appState } from "./utils/pathResolver.js";

// entry point, sets up REPL, handles navigation state
const main = async () => {
  console.log("Welcome to Data Processing CLI!");
  console.log(`\nYou are currently in \x1b[34m${appState.cwd}\x1b[0m`);

  startRepl();
};

main();
