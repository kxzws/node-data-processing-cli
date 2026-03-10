import { createInterface } from "node:readline";
import { exit, stdin, stdout } from "node:process";

// entry point, sets up REPL, handles navigation state
const main = () => {
  const readline = createInterface({
    input: stdin,
    output: stdout,
    prompt: "> ",
  });

  readline.prompt();

  readline
    .on("line", (line) => {
      switch (line.trim()) {
        case "uptime":
          console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
          break;

        case "cwd":
          console.log(`CWD: ${process.cwd()}`);
          break;

        case "date":
          const currentDate = new Date();

          console.log(`Current date: ${currentDate.toISOString()}`);
          break;

        case "exit":
          console.log("Goodbye!");
          exit(0);

        default:
          console.log("Unknown command");
          break;
      }
      readline.prompt();
    })
    .on("close", () => {
      console.log("Goodbye!");
      exit(0);
    });
};

main();
