// parse command line arguments

export const getCommandAndArgs = (input) => {
  const parts = input.split(" ");

  return { command: parts[0], args: parts.slice(1) };
};

export const getArgByName = (args, argName, defaultValue) => {
  return args.indexOf(argName) !== -1
    ? args[args.indexOf(argName) + 1]
    : defaultValue;
};
