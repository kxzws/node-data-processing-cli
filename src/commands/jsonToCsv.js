import { access } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { Transform } from "stream";
import { pipeline } from "stream/promises";

class JsonToCsvTransform extends Transform {
  constructor() {
    super();

    this.headers = null;
    this.buffer = "";
  }

  _transform(chunk, _, callback) {
    this.buffer += chunk.toString();

    const lines = this.buffer.split("\n");

    this.buffer = lines.pop();

    for (const line of lines) {
      if (!line.trim() || ["[", "]"].includes(line.trim())) continue;

      const cleanLine = line.trim().replace(/[\t\r]+/gm, "");

      const recordData = JSON.parse(
        cleanLine[cleanLine.length - 1] === ","
          ? cleanLine.slice(0, -1)
          : cleanLine,
      );

      if (!this.headers) {
        this.headers = Object.keys(recordData);
        this.push(this.headers.join(","));
        this.push("\n");
      }

      this.push(Object.values(recordData).join(","));
      this.push("\n");
    }

    callback();
  }

  _flush(callback) {
    if (
      this.buffer &&
      this.headers &&
      !["[", "]"].includes(this.buffer.trim())
    ) {
      const cleanLine = line.trim().replace(/[\t\r]+/gm, "");

      const recordData = JSON.parse(
        cleanLine[cleanLine.length - 1] === ","
          ? cleanLine.slice(0, -1)
          : cleanLine,
      );

      this.push(Object.values(recordData).join(","));
    }

    callback();
  }
}

// json-to-csv command handler
// example: json-to-csv --input data.json --output data.csv
export const jsonToCsv = async (inputPath, outputPath) => {
  await access(inputPath);

  const readable = createReadStream(inputPath);
  const transform = new JsonToCsvTransform();
  const writable = createWriteStream(outputPath);

  await pipeline(readable, transform, writable);
};
