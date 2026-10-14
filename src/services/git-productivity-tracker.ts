import { execFile } from "node:child_process";
import { promisify } from "node:util";

export const PRODUCTIVITY_KEY = "penguin.git-productivity.v1";
export type ProductivityState = {
  version: 1;
  repositories: Record<string, { head: string; baselineHeads: string[]; rewarded: string[] }>;
};
type Git = (cwd: string, args: string[]) => Promise<string>;
type Dependencies = {
  load(): ProductivityState | undefined;
  save(state: ProductivityState): unknown;
  award(amount: number): void;
  git?: Git;
};
const execute = promisify(execFile);
const git: Git = async (cwd, args) => {
  const { stdout } = await execute("git", args, {
    cwd, timeout: 5000, maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
  });
  return stdout.trim();
};

export function countAddedLines(numstat: string): number {
  return numstat.split("\n").reduce((total, line) => {
    const added = line.split("\t")[0];
    return /^\d+$/.test(added) ? total + Number(added) : total;
  }, 0);
}

/** Poll commit history locally; never award saves, existing history or a merge's aggregate diff. */
export class GitProductivityTracker {
  private state: ProductivityState;
  private busy = false;
  private disposed = false;
  private git: Git;

  constructor(private deps: Dependencies) {
    this.state = deps.load() ?? { version: 1, repositories: {} };
    this.git = deps.git ?? git;
  }

  dispose(): void { this.disposed = true; }

  async scan(folders: string[]): Promise<void> {
    if (this.busy || this.disposed) return;
    this.busy = true;
    const roots = new Set<string>();
    try {
      for (const folder of folders) {
        if (this.disposed) break;
        try {
          const root = await this.git(folder, ["rev-parse", "--show-toplevel"]);
          if (roots.has(root)) continue;
          roots.add(root);
          await this.git(root, ["symbolic-ref", "--quiet", "--short", "HEAD"]);
          let head = "";
          try { head = await this.git(root, ["rev-parse", "--verify", "--quiet", "HEAD"]); } catch { /* Unborn branch. */ }
          if (this.disposed) break;
          let repo = this.state.repositories[root];
          if (!repo) {
            const refs = await this.git(root, ["for-each-ref", "--format=%(objectname)", "refs/heads", "refs/remotes"]);
            if (this.disposed) break;
            repo = this.state.repositories[root] = {
              head, baselineHeads: [...new Set([head, ...refs.split("\n")].filter(Boolean))], rewarded: [],
            };
            await this.deps.save(this.state);
            continue;
          }
          if (!head || head === repo.head) continue;
          // Exclude all initial branch tips; new branches created between polls still earn credit.
          // Include merged commits, skipping the merge itself to avoid its aggregate diff.
          const excluded = [...new Set([repo.head, ...repo.baselineHeads].filter(Boolean))];
          const history = await this.git(root, [
            "rev-list", "--reverse", "--no-merges", head, ...excluded.map(hash => `^${hash}`),
          ]);
          const rewarded = new Set(repo.rewarded);
          let amount = 0;
          for (const commit of history.split("\n").filter(Boolean)) {
            if (rewarded.has(commit)) continue;
            amount += countAddedLines(await this.git(root, ["diff-tree", "--root", "--no-commit-id", "--numstat", "-r", commit]));
            rewarded.add(commit);
          }
          if (this.disposed) break;
          repo.head = head;
          repo.rewarded = [...rewarded];
          await this.deps.save(this.state);
          if (amount > 0) this.deps.award(amount);
        } catch {
          // Git unavailable, detached HEAD, empty/non-Git folder or rewritten/pruned history: retry later.
        }
      }
    } finally { this.busy = false; }
  }
}
