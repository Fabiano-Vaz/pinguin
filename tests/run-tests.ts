const path = require("node:path");
const fs = require("node:fs");

const testsDir = __dirname;
const entries = fs
  .readdirSync(testsDir)
  .filter((file) => file.endsWith(".test.ts"))
  .sort();

for (const file of entries) {
  const fullPath = path.join(testsDir, file);
  // eslint-disable-next-line global-require, import/no-dynamic-require
  require(fullPath);
}

console.log(`executed ${entries.length} test files`);
