const assert = require("node:assert/strict");
const { buildAssetPaths } = require("../src/manifest.ts");
const { artworkTemplates } = require("../src/artwork/artwork-templates.ts");

// Extension URI resolution must only receive real files, never CSS pose IDs.
const resolved = [];
const assets = buildAssetPaths((file) => {
  assert.ok(!file.startsWith("css:"));
  resolved.push(file);
  return `/webview/${file}`;
});
for (const [state, asset] of Object.entries(assets)) {
  if (!(asset as string).startsWith("css:")) continue;
  const pose = artworkTemplates[(asset as string).slice(4)];
  assert.ok(pose, `Missing HTML artwork for ${state}`);
  assert.ok(pose.width > 0 && pose.height > 0);
  assert.match(pose.html, /class="art-layer /);
  assert.doesNotMatch(pose.html, /<(?:svg|img|canvas)\b|data:image|<animate/i);
}
assert.equal(assets.jumping, assets.flying);
assert.equal(assets.runnerBackground, "/webview/backgroung.png");
assert.equal(assets.plane, "/webview/plane.gif");
assert.equal(Object.keys(artworkTemplates).length, 29);
assert.ok(resolved.length > 0);
console.log("artwork coverage and webview asset resolution tests passed");
