import { access } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { scryptSync, createDecipheriv } from "node:crypto";
import { Transform } from "stream";
import { pipeline } from "stream/promises";

class DecryptTransform extends Transform {
  constructor(password) {
    super();

    this.password = password;
    this.decipher = null;
    this.buffer = Buffer.alloc(0);
  }

  _transform(chunk, _, callback) {
    if (!this.decipher) {
      this.buffer = Buffer.concat([this.buffer, chunk]);

      if (this.buffer.length < 16 + 12) {
        return callback();
      }

      const salt = this.buffer.subarray(0, 16);
      const iv = this.buffer.subarray(16, 16 + 12);
      const key = scryptSync(this.password, salt, 32);

      this.decipher = createDecipheriv("aes-256-gcm", key, iv);

      const remaining = this.buffer.subarray(16 + 12);
      this.buffer = remaining;

      return callback();
    }

    this.buffer = Buffer.concat([this.buffer, chunk]);

    callback();
  }

  _flush(callback) {
    if (!this.decipher || !this.buffer || this.buffer.length < 16) {
      return callback(new Error());
    }

    const authTag = this.buffer.subarray(this.buffer.length - 16);
    const encrypted = this.buffer.subarray(0, this.buffer.length - 16);

    this.decipher.setAuthTag(authTag);

    this.push(this.decipher.update(encrypted));
    this.push(this.decipher.final());

    callback();
  }
}

// decrypt command handler
// example: decrypt --input file.txt.enc --output file.txt --password mySecret
export const decrypt = async (inputPath, outputPath, password) => {
  await access(inputPath);

  const readable = createReadStream(inputPath);
  const transform = new DecryptTransform(password);
  const writable = createWriteStream(outputPath);

  await pipeline(readable, transform, writable);
};
