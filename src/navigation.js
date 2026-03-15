import path from "node:path";
import { access, readdir } from "node:fs/promises";

import { appState } from "./utils/pathResolver.js";

// navigation commands (up, cd, ls)

export const up = async () => {
  if (appState.cwd === appState.rootDirectory) return;

  await access(path.dirname(appState.cwd));

  appState.cwd = path.dirname(appState.cwd);
};

export const cd = async (args) => {
  const targetPath = args[0];

  await access(path.resolve(appState.cwd, targetPath));

  appState.cwd = path.resolve(appState.cwd, targetPath);
};

export const ls = async () => {
  await access(path.resolve(appState.cwd));

  const files = await readdir(appState.cwd, { withFileTypes: true });

  const groups = files.reduce(
    (acc, cur) => {
      if (cur.isFile()) {
        acc.files.push(cur);
      } else {
        acc.folders.push(cur);
      }

      return acc;
    },
    { files: [], folders: [] },
  );

  [
    ...groups.folders.sort((a, b) => a.name.localeCompare(b.name)),
    ...groups.files.sort((a, b) => a.name.localeCompare(b.name)),
  ].forEach((entry) =>
    console.log(`${entry.name} [${entry.isFile() ? "file" : "folder"}]`),
  );
};
