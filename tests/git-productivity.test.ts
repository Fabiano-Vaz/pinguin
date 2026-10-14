const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { GitProductivityTracker, countAddedLines } = require("../src/services/git-productivity-tracker.ts");

module.exports = (async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "penguin-productivity-"));
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  let saved;
  let total = 0;
  const makeTracker = () => new GitProductivityTracker({
    load: () => saved,
    save: state => { saved = JSON.parse(JSON.stringify(state)); },
    award: amount => { total += amount; },
  });
  try {
    assert.equal(countAddedLines("3\t2\tcode.ts\n-\t-\timage.png\n0\t5\tdeleted.ts"), 3);
    git("init", "-b", "main");
    git("config", "user.name", "Penguin Test");
    git("config", "user.email", "penguin@example.test");
    const empty = path.join(root, "empty");
    fs.mkdirSync(empty);
    execFileSync("git", ["init", "-b", "main", empty], { stdio: "ignore" });
    const emptyGit = (...args) => execFileSync("git", args, { cwd: empty, stdio: "ignore" });
    emptyGit("config", "user.name", "Penguin Test");
    emptyGit("config", "user.email", "penguin@example.test");
    const initialTracker = makeTracker();
    await initialTracker.scan([empty]);
    fs.writeFileSync(path.join(empty, "first.txt"), "first line\n");
    emptyGit("add", "."); emptyGit("commit", "-m", "First commit");
    await initialTracker.scan([empty]);
    assert.equal(total, 1, "A first commit in an initially empty repository earns fish");
    initialTracker.dispose();
    fs.rmSync(empty, { recursive: true, force: true });
    total = 0;
    const file = path.join(root, "code.txt");
    fs.writeFileSync(file, "existing\n");
    git("add", "."); git("commit", "-m", "Baseline");
    let tracker = makeTracker();
    await tracker.scan([root]);
    assert.equal(total, 0, "Existing history sets a baseline without a reward");
    fs.appendFileSync(file, "one\ntwo\n");
    await tracker.scan([root]);
    assert.equal(total, 0, "Saving without committing earns nothing");
    git("add", "."); git("commit", "-m", "Two added lines");
    await tracker.scan([root, root]);
    assert.equal(total, 2, "Each committed added line earns one fish; nested folders do not duplicate credit");
    await tracker.scan([root]);
    tracker = makeTracker();
    await tracker.scan([root]);
    assert.equal(total, 2, "Polling and restarting do not reward the same commit twice");
    fs.writeFileSync(file, "existing\none\n");
    git("add", "."); git("commit", "-m", "Removal only");
    await tracker.scan([root]);
    assert.equal(total, 2, "Deleted lines do not earn fish");
    git("switch", "-c", "feature");
    fs.writeFileSync(path.join(root, "feature.txt"), "feature line\n");
    git("add", "."); git("commit", "-m", "Feature line");
    await tracker.scan([root]);
    assert.equal(total, 3, "A branch created and committed between polls still earns fish");
    git("switch", "main");
    git("merge", "--no-ff", "feature", "-m", "Merge feature");
    await tracker.scan([root]);
    assert.equal(total, 3, "Merging an already rewarded commit does not earn duplicate fish");
    git("switch", "-c", "unobserved");
    fs.writeFileSync(path.join(root, "other.txt"), "new\nlines\n");
    git("add", "."); git("commit", "-m", "Two lines on another branch");
    git("switch", "main");
    git("merge", "--no-ff", "unobserved", "-m", "Merge unobserved work");
    await tracker.scan([root]);
    assert.equal(total, 5, "A merge credits new underlying commits once, excluding the merge diff");
    tracker.dispose();
    fs.appendFileSync(file, "after dispose\n");
    git("add", "."); git("commit", "-m", "Disposed");
    await tracker.scan([root]);
    assert.equal(total, 5, "A disposed tracker cannot award more fish");
    console.log("Git productivity commit rewards, persistence, branches and merges passed");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
})();
