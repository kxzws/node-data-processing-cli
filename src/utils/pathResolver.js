import { homedir } from "node:os";

// resolve paths relative to current working directory

export const appState = {
  rootDirectory: homedir(),
  cwd: homedir(),
};
