import { access } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { randomBytes, createCipheriv, scryptSync } from "node:crypto";
import { pipeline } from "stream/promises";

// encrypt command handler
// example: encrypt --input file.txt --output file.txt.enc --password mySecret
export const encrypt = async (inputPath, outputPath, password) => {
  await access(inputPath);

  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = scryptSync(password, salt, 32);

  const readable = createReadStream(inputPath);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const writable = createWriteStream(outputPath);

  writable.write(salt);
  writable.write(iv);

  await pipeline(readable, cipher, writable);

  const authTag = cipher.getAuthTag();

  writable.write(authTag);
};
