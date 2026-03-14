import { access } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { Transform } from "stream";
import { pipeline } from "stream/promises";

class CsvToJsonTransform extends Transform {
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
      if (!line.trim()) continue;

      if (!this.headers) {
        this.headers = line.replace("\r", "").split(",");
        this.push("[\n");

        continue;
      }

      const recordValues = line.replace("\r", "").split(",");
      const obj = {};

      this.headers.forEach((header, ind) => {
        obj[header] = recordValues[ind];
      });

      this.push("\t");
      this.push(JSON.stringify(obj));
      this.push(",\n");
    }

    callback();
  }

  _flush(callback) {
    if (this.buffer && this.headers) {
      const recordValues = this.buffer.replace("\r", "").split(",");
      const obj = {};

      this.headers.forEach((header, ind) => {
        obj[header] = recordValues[ind];
      });

      this.push("\t");
      this.push(JSON.stringify(obj));
    }

    this.push("\n]");

    callback();
  }
}

// csv-to-json command handler
// example: csv-to-json --input data.csv --output data.json
export const csvToJson = async (inputPath, outputPath) => {
  await access(inputPath);

  const readable = createReadStream(inputPath);
  const transform = new CsvToJsonTransform();
  const writable = createWriteStream(outputPath);

  await pipeline(readable, transform, writable);
};
