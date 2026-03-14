// parse command line arguments

export const getCommandAndArgs = (input) => {
  const parts = input.split(" ");

  return { command: parts[0], args: parts.slice(1) };
};
