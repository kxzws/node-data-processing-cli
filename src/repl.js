import path from "node:path";
import { createInterface } from "node:readline";
import { exit, stdin, stdout } from "node:process";

import { ls, up, cd } from "./navigation.js";

import { csvToJson } from "./commands/csvToJson.js";
import { jsonToCsv } from "./commands/jsonToCsv.js";
import { count } from "./commands/count.js";

import { getCommandAndArgs, getArgByName } from "./utils/argParser.js";
import { appState } from "./utils/pathResolver.js";

const handleSuccessAndErrors = async (callback) => {
  try {
    await callback();

    console.log(`\nYou are currently in \x1b[34m${appState.cwd}\x1b[0m`);
  } catch (err) {
    console.log(`Operation failed: \x1b[31m${err}\x1b[0m`);
  }
};

// REPL handler, command parsing and dispatching
export const startRepl = async () => {
  const readline = createInterface({
    input: stdin,
    output: stdout,
    prompt: "> ",
  });

  readline.prompt();

  readline
    .on("line", async (line) => {
      const { command, args } = getCommandAndArgs(line.trim());

      switch (true) {
        case command === "ls" && !args.length: {
          await handleSuccessAndErrors(async () => {
            await ls();
          });

          break;
        }

        case command === "up" && !args.length: {
          await handleSuccessAndErrors(async () => {
            await up();
          });

          break;
        }

        case command === "cd" && !!args.length && args.length < 2: {
          await handleSuccessAndErrors(async () => {
            await cd(args);
          });

          break;
        }

        case command === ".exit": {
          console.log("Thank you for using Data Processing CLI!");

          exit(0);
        }

        case command === "csv-to-json" && args.length === 4: {
          await handleSuccessAndErrors(async () => {
            const inputPath = getArgByName(args, "--input");
            const outputPath = getArgByName(args, "--output");

            if (!inputPath || !outputPath) throw Error("Invalid argument");

            await csvToJson(
              path.resolve(appState.cwd, inputPath),
              path.resolve(appState.cwd, outputPath),
            );
          });

          break;
        }

        case command === "json-to-csv" && args.length === 4: {
          await handleSuccessAndErrors(async () => {
            const inputPath = getArgByName(args, "--input");
            const outputPath = getArgByName(args, "--output");

            if (!inputPath || !outputPath) throw Error("Invalid argument");

            await jsonToCsv(
              path.resolve(appState.cwd, inputPath),
              path.resolve(appState.cwd, outputPath),
            );
          });

          break;
        }

        case command === "count" && args.length === 2: {
          await handleSuccessAndErrors(async () => {
            const inputPath = getArgByName(args, "--input");

            if (!inputPath) throw Error("Invalid argument");

            await count(path.resolve(appState.cwd, inputPath));
          });

          break;
        }

        default:
          console.log("\x1b[31mInvalid input\x1b[0m");

          break;
      }

      readline.prompt();
    })
    .on("close", () => {
      console.log("Thank you for using Data Processing CLI!");

      exit(0);
    });
};
