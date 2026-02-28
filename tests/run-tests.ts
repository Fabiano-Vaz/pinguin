const path = require("node:path");
const fs = require("node:fs");

const isTTY = Boolean(process.stdout && process.stdout.isTTY);
const color = (code: number, text: string) =>
  isTTY ? `\x1b[${code}m${text}\x1b[0m` : text;
const green = (text: string) => color(32, text);
const red = (text: string) => color(31, text);
const yellow = (text: string) => color(33, text);
const cyan = (text: string) => color(36, text);
const gray = (text: string) => color(90, text);

const testsDir = __dirname;
const entries = fs
  .readdirSync(testsDir)
  .filter((file) => file.endsWith(".test.ts"))
  .sort();

console.log(cyan(`Running ${entries.length} test files...`));

const startedAt = Date.now();
let passed = 0;
let failed = 0;

for (const [index, file] of entries.entries()) {
  const fullPath = path.join(testsDir, file);
  const fileStartedAt = Date.now();

  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(fullPath);
    passed += 1;
    const durationMs = Date.now() - fileStartedAt;
    console.log(green(`✓ [${index + 1}/${entries.length}] ${file} (${durationMs}ms)`));
  } catch (error) {
    failed += 1;
    const durationMs = Date.now() - fileStartedAt;
    console.error(red(`✗ [${index + 1}/${entries.length}] ${file} (${durationMs}ms)`));
    if (error && typeof error === "object" && "stack" in error && error.stack) {
      console.error(gray(String(error.stack)));
    } else {
      console.error(gray(String(error)));
    }
  }
}

const totalMs = Date.now() - startedAt;
console.log("");
console.log(cyan("Test Summary"));
console.log(gray("------------"));
console.log(green(`Passed: ${passed}`));
if (failed > 0) {
  console.log(red(`Failed: ${failed}`));
} else {
  console.log(green(`Failed: ${failed}`));
}
console.log(yellow(`Duration: ${totalMs}ms`));

if (failed > 0) {
  process.exitCode = 1;
}
