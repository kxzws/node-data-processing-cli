import path from "node:path";
import { createInterface } from "node:readline";
import { exit, stdin, stdout } from "node:process";

import { ls, up, cd } from "./navigation.js";

import { csvToJson } from "./commands/csvToJson.js";
import { jsonToCsv } from "./commands/jsonToCsv.js";
import { count } from "./commands/count.js";
import { hash } from "./commands/hash.js";
import { hashCompare } from "./commands/hashCompare.js";
import { encrypt } from "./commands/encrypt.js";
import { decrypt } from "./commands/decrypt.js";

import {
  getCommandAndArgs,
  getArgByName,
  getArgFlagByName,
} from "./utils/argParser.js";
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

            if (!inputPath || !outputPath) throw new Error("Invalid argument");

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

            if (!inputPath || !outputPath) throw new Error("Invalid argument");

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

            if (!inputPath) throw new Error("Invalid argument");

            await count(path.resolve(appState.cwd, inputPath));
          });

          break;
        }

        case command === "hash" && args.length > 1 && args.length < 6: {
          await handleSuccessAndErrors(async () => {
            const inputPath = getArgByName(args, "--input");
            const algorithm = getArgByName(args, "--algorithm", "sha256");
            const isSave = getArgFlagByName(args, "--save");

            if (!inputPath) throw new Error("Invalid argument");
            if (!["sha256", "md5", "sha512"].includes(algorithm))
              throw new Error("Invalid argument");

            await hash(
              path.resolve(appState.cwd, inputPath),
              algorithm,
              isSave,
            );
          });

          break;
        }

        case command === "hash-compare" && args.length > 1 && args.length < 7: {
          await handleSuccessAndErrors(async () => {
            const inputPath = getArgByName(args, "--input");
            const hashPath = getArgByName(args, "--hash");
            const algorithm = getArgByName(args, "--algorithm", "sha256");

            if (!inputPath || !hashPath) throw new Error("Invalid argument");
            if (!["sha256", "md5", "sha512"].includes(algorithm))
              throw new Error("Invalid argument");

            await hashCompare(
              path.resolve(appState.cwd, inputPath),
              path.resolve(appState.cwd, hashPath),
              algorithm,
            );
          });

          break;
        }

        case command === "encrypt" && args.length === 6: {
          await handleSuccessAndErrors(async () => {
            const inputPath = getArgByName(args, "--input");
            const outputPath = getArgByName(args, "--output");
            const password = getArgByName(args, "--password");

            if (!inputPath || !outputPath || !password)
              throw new Error("Invalid argument");

            await encrypt(
              path.resolve(appState.cwd, inputPath),
              path.resolve(appState.cwd, outputPath),
              password,
            );
          });

          break;
        }

        case command === "decrypt" && args.length === 6: {
          await handleSuccessAndErrors(async () => {
            const inputPath = getArgByName(args, "--input");
            const outputPath = getArgByName(args, "--output");
            const password = getArgByName(args, "--password");

            if (!inputPath || !outputPath || !password)
              throw new Error("Invalid argument");

            await decrypt(
              path.resolve(appState.cwd, inputPath),
              path.resolve(appState.cwd, outputPath),
              password,
            );
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
