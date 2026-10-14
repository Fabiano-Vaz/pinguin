const fs = require("node:fs");
const ts = require("typescript");

// Use the project's compiler so tests also run on Node builds without type stripping.
require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const result = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
    },
  });
  module._compile(result.outputText, filename);
};
