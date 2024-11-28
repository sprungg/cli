import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import config from './config';
import git from './git';
import chalk from 'chalk';

// Path to store session data (can be expanded to use a database or secure store)
const sessionFilePath = path.join(__dirname, '../.session.json');

// Define session data structure
interface SessionData {
  contributionId: string;
  branchName: string;
  repoUrl: string;
  editorCommand?: string;
  isAuthenticated: boolean;
  localFolderPath?: string;
}

const sessionManager = {
  // Check if session file exists, otherwise create it
  initializeSession: (): SessionData => {
    if (!fs.existsSync(sessionFilePath)) {
      const initialSession: SessionData = {
        contributionId: '',
        branchName: '',
        repoUrl: '',
        isAuthenticated: false,
      };
      fs.writeFileSync(sessionFilePath, JSON.stringify(initialSession, null, 2));
      return initialSession;
    }

    const sessionData = fs.readFileSync(sessionFilePath, 'utf-8');
    return JSON.parse(sessionData);
  },

  // Save session to the session file
  saveSession: (session: SessionData): void => {
    fs.writeFileSync(sessionFilePath, JSON.stringify(session, null, 2));
  },

  // clear the session
  clearSession: (): void => {
    fs.writeFileSync(sessionFilePath, JSON.stringify({}, null, 2));
  },

  // Function to authenticate user
  authenticate: async (): Promise<boolean> => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'Enter your username:',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter your password:',
        mask: '*',
      },
    ]);

    // In a real app, you would validate credentials against a database or authentication service.
    // For now, we'll mock authentication
    if (answers.username === 'admin' && answers.password === 'password') {
      console.log(chalk.green('Authentication successful.'));
      return true;
    } else {
      console.log(chalk.red('Authentication failed.'));
      return false;
    }
  },

  // Function to set the contribution details
  setContributionDetails: async (session: SessionData, contributionId: string, branchName: string, repoUrl: string): Promise<SessionData> => {
    // Update the session with the contribution details
    session.contributionId = contributionId;
    session.branchName = branchName;
    session.repoUrl = repoUrl;

    sessionManager.saveSession(session);
    return session;
  },

  // Function to check if a default editor is available
  detectEditor: (): string | undefined => {
    const possibleEditors = ['code', 'subl', 'atom', 'vim'];

    for (const editor of possibleEditors) {
      try {
        execSync(`which ${editor}`);
        return editor;
      } catch (error) {
        continue;
      }
    }

    return undefined;
  },

  //   sync current branch with remote
  sync: async (): Promise<void> => {
    // check current session for repo path, then navigate to that path and sync
    const session: SessionData = sessionManager.initializeSession();
    if (!session.localFolderPath || !session.branchName) {
      console.log(chalk.red('No repository path or branch found in session.'));
      return;
    }
    await git.checkoutBranch(session.localFolderPath, session.branchName);
    execSync('git fetch', { stdio: 'inherit' });
    execSync('git pull origin main', { stdio: 'inherit' });
    console.log(chalk.green('Sync completed.'));
  },

  //  push changes to remote
  push: async (options: { message: string }): Promise<void> => {
    const session: SessionData = sessionManager.initializeSession();
    if (!session.localFolderPath || !session.branchName) {
      console.log(chalk.red('No repository path or branch found in session.'));
      return;
    }
    await git.checkoutBranch(session.localFolderPath, session.branchName);
    await git.commitChanges(session.localFolderPath, options.message, session.branchName);
    console.log(chalk.green('Push completed.'));
    // to do: update the contribution status in sprungg, then clear the session
  },

  // Main function to initialize the session and interact with the user
  start: async (options: { contributionId: string; branchName: string; repoUrl: string; localFolderPath: string }): Promise<void> => {
    let session: SessionData = sessionManager.initializeSession();

    if (!session.isAuthenticated) {
      const isAuthenticated = await sessionManager.authenticate();
      if (!isAuthenticated) {
        console.log(chalk.red('Exiting due to failed authentication.'));
        return;
      }

      session.isAuthenticated = true;
      sessionManager.saveSession(session);
    }

    console.log(chalk.green(`Welcome! Contribution ID: ${session.contributionId}`));

    session = await sessionManager.setContributionDetails(session, options.contributionId, options.branchName, options.repoUrl);

    // Clone the repository if it doesn't already exist
    if (!fs.existsSync(options.localFolderPath)) {
      console.log(chalk.green(`Cloning repository from ${options.repoUrl} to ${options.localFolderPath}...`));
      execSync(`git clone ${options.repoUrl} ${options.localFolderPath}`, { stdio: 'inherit' });
      console.log(chalk.green('Repository cloned successfully.'));
    } else {
      console.log(chalk.yellow(`Repository already exists at ${options.localFolderPath}.`));
    }

    // Set the repository and local folder mapping in the session and config
    session.repoUrl = options.repoUrl;
    session.localFolderPath = options.localFolderPath;
    sessionManager.saveSession(session);

    config.saveRepoPath(options.repoUrl, options.localFolderPath);



    // Detect the editor (or ask user if none found)
    let editorCommand = sessionManager.detectEditor();
    if (!editorCommand) {
      console.log(chalk.yellow('No default editor found.'));
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'editorCommand',
          message: 'Enter the command to open your preferred code editor:',
        },
      ]);
      editorCommand = answers.editorCommand;
    }

    // checkout the branch
    console.log(chalk.green(`Checking out branch: ${session.branchName}`));
    process.chdir(session.localFolderPath);
    // create a new branch if it doesn't exist\
    try {
      console.log(chalk.green(`Checking out branch: ${session.branchName}`));
      await git.checkoutBranch(session.localFolderPath, session.branchName);
    } catch (error) {
      console.log(chalk.red(`Error checking out branch: ${error}`));
      return;   
    }

    console.log(chalk.green(`Launching ${editorCommand} for the repository: ${session.localFolderPath}`));

    // Launch the editor
    execSync(`${editorCommand} ${session.localFolderPath}`);
  },
};

export default sessionManager;