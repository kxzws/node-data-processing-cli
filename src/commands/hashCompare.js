import { access, readFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { Transform } from "stream";

class HashCompareTransform extends Transform {
  constructor(algorithm, hashToCompare) {
    super();

    this.algorithm = algorithm;
    this.hash = createHash(algorithm);
    this.hashToCompare = hashToCompare;
  }

  _transform(chunk, _, callback) {
    this.hash.update(chunk);

    callback();
  }

  _flush(callback) {
    console.log(
      this.hash.digest("hex").toLowerCase() === this.hashToCompare.toLowerCase()
        ? "OK"
        : "MISMATCH",
    );

    callback();
  }
}

// hash-compare command handler
// example: hash-compare --input file.txt --hash file.txt.sha256
// example: hash-compare --input file.txt --hash file.txt.md5 --algorithm md5
export const hashCompare = async (inputPath, hashPath, algorithm) => {
  await access(inputPath);
  await access(hashPath);

  const hashToCompareValue = await readFile(hashPath, "utf8");
  const hashToCompare = hashToCompareValue.trim().replace(/[\t\r\n]+/gm, "");

  const readable = createReadStream(inputPath);
  const transform = new HashCompareTransform(algorithm, hashToCompare);

  await new Promise((resolve, reject) => {
    readable.pipe(transform).on("finish", resolve).on("error", reject);
  });
};
