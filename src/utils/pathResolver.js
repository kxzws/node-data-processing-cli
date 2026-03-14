import { homedir } from "node:os";

// resolve paths relative to current working directory

const isTesting = true;

export const appState = {
  rootDirectory: isTesting ? "D:\\frontend-projects\\nodejs course\\workspace" : homedir(),
  cwd: isTesting ? "D:\\frontend-projects\\nodejs course\\workspace" : homedir(),
};
