"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const simple_git_1 = __importDefault(require("simple-git"));
const git = (0, simple_git_1.default)();
const gitOps = {
    async clone(repo, contributionId) {
        const localPath = `./repos/${contributionId}`;
        await git.clone(repo, localPath);
        console.log(`Repository cloned to ${localPath}`);
        return localPath;
    },
    async checkoutBranch(path, branch) {
        await git.cwd(path).checkout(branch).catch(async () => {
            await git.checkoutLocalBranch(branch);
        });
        console.log(`Checked out branch: ${branch}`);
    },
    async stashChanges(path, contributionId) {
        await git.cwd(path).stash(['push', '-m', `Stash for ${contributionId}`]);
        console.log('Changes stashed.');
    },
    async sync(path) {
        await git.cwd(path).fetch();
        await git.rebase(['origin/main']);
        console.log('Repository synced.');
    },
};
exports.default = gitOps;
