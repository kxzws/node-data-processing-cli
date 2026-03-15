import { access, stat, open } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { scryptSync, createDecipheriv } from "node:crypto";
import { pipeline } from "stream/promises";

// decrypt command handler
// example: decrypt --input file.txt.enc --output file.txt --password mySecret
export const decrypt = async (inputPath, outputPath, password) => {
  await access(inputPath);

  const stats = await stat(inputPath);
  const fileSize = stats.size;

  if (fileSize < 16 + 12 + 16) throw new Error("File is too small");

  const fileDec = await open(inputPath, "r");

  const salt = Buffer.alloc(16);
  const iv = Buffer.alloc(12);
  const authTag = Buffer.alloc(16);

  fileDec.read(salt, 0, 16, 0);
  fileDec.read(iv, 0, 12, 16);
  fileDec.read(authTag, 0, 16, fileSize - 16);

  const key = scryptSync(password, salt, 32);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const readable = createReadStream(inputPath, {
    fd: fileDec,
    start: 28,
    end: fileSize - 17,
    autoClose: true,
  });
  const writable = createWriteStream(outputPath);

  await pipeline(readable, decipher, writable);
};
