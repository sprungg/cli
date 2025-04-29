import simpleGit, { SimpleGit } from "simple-git";

const git: SimpleGit = simpleGit();

const gitOps = {
  async clone(repo: string, contributionId: string): Promise<string> {
    const localPath = `./repos/${contributionId}`;
    await git.clone(repo, localPath);
    console.log(`Repository cloned to ${localPath}`);
    return localPath;
  },

  async checkoutBranch(path: string, branch: string): Promise<void> {
    await git
      .cwd(path)
      .checkout(branch)
      .catch(async () => {
        await git.checkoutLocalBranch(branch);
      });
    console.log(`Checked out branch: ${branch}`);
  },

  async stashChanges(path: string, contributionId: string): Promise<void> {
    await git.cwd(path).stash(["push", "-m", `Stash for ${contributionId}`]);
    console.log("Changes stashed.");
  },

  async commitChanges(
    path: string,
    message: string,
    targetBranch: string
  ): Promise<void> {
    await git.cwd(path).add(".");
    await git.commit(message);
    await git.push("origin", targetBranch);
    console.log("Changes committed and pushed.");
  },

  async sync(path: string): Promise<void> {
    await git.cwd(path).fetch();
    await git.rebase(["origin/main"]);
    console.log("Repository synced.");
  },

  // Check if branch exists locally, else check remotely, if not create it
  async branchesValid(
    path: string,
    sourceBranch: string,
    destinationBranch: string,
    readOnly?: boolean
  ): Promise<boolean> {
    const localBranches = await git.cwd(path).branchLocal();
    const remoteBranches = await git.cwd(path).branch(["-r"]);
    const currentBranch = await this.checkCurrentBranch(path);
    if (!localBranches.all.includes(destinationBranch)) {
      if (readOnly) return false;
      const remoteBranch = remoteBranches.all.find(
        (branch) => branch.replace("origin/", "") === destinationBranch
      );
      if (remoteBranch) {
        currentBranch === destinationBranch
          ? await git.cwd(path).pull(["origin", destinationBranch])
          : await git
              .cwd(path)
              .fetch(["origin", `${destinationBranch}:${destinationBranch}`]);
      } else {
        return false;
      }
    }
    !readOnly &&
      (currentBranch === destinationBranch
        ? await git.cwd(path).pull(["origin", destinationBranch])
        : await git
            .cwd(path)
            .fetch(["origin", `${destinationBranch}:${destinationBranch}`]));
    if (!localBranches.all.includes(sourceBranch)) {
      if (readOnly) return false;
      if (!remoteBranches.all.includes(sourceBranch)) {
        await git.cwd(path).checkoutBranch(sourceBranch, destinationBranch);
      } else {
        currentBranch === sourceBranch
          ? await git.cwd(path).pull(["origin", sourceBranch])
          : await git
              .cwd(path)
              .fetch(["origin", `${sourceBranch}:${sourceBranch}`]);
      }
    }
    return true;
  },

  async getDiff(path: string, branch: string): Promise<string> {
    // Get all changes including untracked files, staged, unstaged, and committed changes
    const diff = await git
      .cwd(path)
      .diff([branch]);
      // .diff([branch, "--cached", "--staged", "--full-index", "--no-renames"]);
    return diff;
  },

  async getBranchDiff(
    path: string,
    sourceBranch: string,
    destinationBranch: string
  ): Promise<string> {
    const diff = await git
      .cwd(path)
      .diff([`${destinationBranch}...${sourceBranch}`]);
    return diff;
  },

  async checkCurrentBranch(path: string): Promise<string> {
    const currentBranch = await git.cwd(path).branch();
    return currentBranch.current;
  },
};

export default gitOps;
