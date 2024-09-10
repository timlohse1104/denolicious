import * as path from "https://deno.land/std@0.169.0/path/mod.ts";
import { chmodSync, copyFileSync } from "node:fs";

const sourceDir = path.join(".", "git-hooks");
const targetDir = path.join(".", ".git", "hooks");

// Copy files
for await (const entry of Deno.readDir(sourceDir)) {
  if (entry.isFile) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    copyFileSync(sourcePath, targetPath);
    chmodSync(targetPath, "755");
  }
}

console.log("Git hooks copied and permissions set.");
