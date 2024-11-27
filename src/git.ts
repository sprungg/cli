import simpleGit, { SimpleGit } from 'simple-git';

const git: SimpleGit = simpleGit();

const gitOps = {
  async clone(repo: string, contributionId: string): Promise<string> {
    const localPath = `./repos/${contributionId}`;
    await git.clone(repo, localPath);
    console.log(`Repository cloned to ${localPath}`);
    return localPath;
  },

  async checkoutBranch(path: string, branch: string): Promise<void> {
    await git.cwd(path).checkout(branch).catch(async () => {
      await git.checkoutLocalBranch(branch);
    });
    console.log(`Checked out branch: ${branch}`);
  },

  async stashChanges(path: string, contributionId: string): Promise<void> {
    await git.cwd(path).stash(['push', '-m', `Stash for ${contributionId}`]);
    console.log('Changes stashed.');
  },

  async sync(path: string): Promise<void> {
    await git.cwd(path).fetch();
    await git.rebase(['origin/main']);
    console.log('Repository synced.');
  },
};

export default gitOps;
