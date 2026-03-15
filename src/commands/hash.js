import path from "node:path";
import { access } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { createHash } from "node:crypto";
import { Transform } from "stream";
import { pipeline } from "stream/promises";

import { appState } from "../utils/pathResolver.js";

class HashTransform extends Transform {
  constructor(algorithm, isSave) {
    super();

    this.algorithm = algorithm;
    this.isSave = isSave;
    this.hash = createHash(algorithm);
  }

  _transform(chunk, _, callback) {
    this.hash.update(chunk);

    callback();
  }

  _flush(callback) {
    if (this.isSave) {
      this.push(this.hash.digest("hex"));
    } else {
      console.log(`\n${this.algorithm}: ${this.hash.digest("hex")}`);
    }

    callback();
  }
}

// hash command handler
// example: hash --input file.txt
// example: hash --input file.txt --algorithm md5
// example: hash --input file.txt --save
export const hash = async (inputPath, algorithm, isSave) => {
  await access(inputPath);

  const readable = createReadStream(inputPath);
  const transform = new HashTransform(algorithm, isSave);

  if (isSave) {
    const fileName = path.basename(inputPath);
    const outputPath = path.resolve(appState.cwd, `${fileName}.${algorithm}`);

    const writable = createWriteStream(outputPath);

    await pipeline(readable, transform, writable);
  } else {
    await new Promise((resolve, reject) => {
      readable.pipe(transform).on("finish", resolve).on("error", reject);
    });
  }
};
