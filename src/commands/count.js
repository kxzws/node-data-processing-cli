import { access } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Transform } from "stream";

class CountTransform extends Transform {
  constructor() {
    super();

    this.lines = 0;
    this.words = 0;
    this.chars = 0;
    this.buffer = "";
  }

  _transform(chunk, _, callback) {
    this.buffer += chunk.toString();

    const lines = this.buffer.split("\n");

    this.buffer = lines.pop();
    this.lines += lines.length;

    for (const line of lines) {
      if (!line.trim()) continue;

      this.words += line.split(" ").length;
      this.chars += line.length;
    }

    callback();
  }

  _flush(callback) {
    if (this.buffer) {
      this.lines += 1;
      this.words += this.buffer.split(" ").length;
      this.chars += this.buffer.length;
    }

    console.log(
      `\nLines: ${this.lines}\nWords: ${this.words}\nCharacters: ${this.chars}`,
    );

    callback();
  }
}

// count command handler
// example: count --input file.txt
export const count = async (inputPath) => {
  await access(inputPath);

  const readable = createReadStream(inputPath);
  const transform = new CountTransform();

  await new Promise((resolve, reject) => {
    readable.pipe(transform).on("finish", resolve).on("error", reject);
  });
};
