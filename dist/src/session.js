"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const inquirer_1 = __importDefault(require("inquirer"));
const config_1 = __importDefault(require("./config"));
const chalk_1 = __importDefault(require("chalk"));
// Path to store session data (can be expanded to use a database or secure store)
const sessionFilePath = path.join(__dirname, '../.session.json');
const sessionManager = {
    // Check if session file exists, otherwise create it
    initializeSession: () => {
        if (!fs.existsSync(sessionFilePath)) {
            const initialSession = {
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
    saveSession: (session) => {
        fs.writeFileSync(sessionFilePath, JSON.stringify(session, null, 2));
    },
    // clear the session
    clearSession: () => {
        fs.writeFileSync(sessionFilePath, JSON.stringify({}, null, 2));
    },
    // Function to authenticate user
    authenticate: async () => {
        const answers = await inquirer_1.default.prompt([
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
            console.log(chalk_1.default.green('Authentication successful.'));
            return true;
        }
        else {
            console.log(chalk_1.default.red('Authentication failed.'));
            return false;
        }
    },
    // Function to set the contribution details
    setContributionDetails: async (session, contributionId, branchName, repoUrl) => {
        // Update the session with the contribution details
        session.contributionId = contributionId;
        session.branchName = branchName;
        session.repoUrl = repoUrl;
        sessionManager.saveSession(session);
        return session;
    },
    // Function to check if a default editor is available
    detectEditor: () => {
        const possibleEditors = ['code', 'subl', 'atom', 'vim'];
        for (const editor of possibleEditors) {
            try {
                (0, child_process_1.execSync)(`which ${editor}`);
                return editor;
            }
            catch (error) {
                continue;
            }
        }
        return undefined;
    },
    //   sync current branch with remote
    sync: async () => {
        console.log('Syncing with remote repository...');
        (0, child_process_1.execSync)('git fetch', { stdio: 'inherit' });
        (0, child_process_1.execSync)('git pull', { stdio: 'inherit' });
        console.log(chalk_1.default.green('Sync completed.'));
    },
    // Main function to initialize the session and interact with the user
    start: async (options) => {
        let session = sessionManager.initializeSession();
        if (!session.isAuthenticated) {
            const isAuthenticated = await sessionManager.authenticate();
            if (!isAuthenticated) {
                console.log(chalk_1.default.red('Exiting due to failed authentication.'));
                return;
            }
            session.isAuthenticated = true;
            sessionManager.saveSession(session);
        }
        console.log(chalk_1.default.green(`Welcome! Contribution ID: ${session.contributionId}`));
        session = await sessionManager.setContributionDetails(session, options.contributionId, options.branchName, options.repoUrl);
        // Clone the repository if it doesn't already exist
        if (!fs.existsSync(options.localFolderPath)) {
            console.log(chalk_1.default.green(`Cloning repository from ${options.repoUrl} to ${options.localFolderPath}...`));
            (0, child_process_1.execSync)(`git clone ${options.repoUrl} ${options.localFolderPath}`, { stdio: 'inherit' });
            console.log(chalk_1.default.green('Repository cloned successfully.'));
        }
        else {
            console.log(chalk_1.default.yellow(`Repository already exists at ${options.localFolderPath}.`));
        }
        // Set the repository and local folder mapping in the session and config
        session.repoUrl = options.repoUrl;
        session.localFolderPath = options.localFolderPath;
        sessionManager.saveSession(session);
        config_1.default.saveRepoPath(options.repoUrl, options.localFolderPath);
        // Detect the editor (or ask user if none found)
        let editorCommand = sessionManager.detectEditor();
        if (!editorCommand) {
            console.log(chalk_1.default.yellow('No default editor found.'));
            const answers = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'editorCommand',
                    message: 'Enter the command to open your preferred code editor:',
                },
            ]);
            editorCommand = answers.editorCommand;
        }
        console.log(chalk_1.default.green(`Launching ${editorCommand} for the repository: ${session.localFolderPath}`));
        // Launch the editor
        (0, child_process_1.execSync)(`${editorCommand} ${session.localFolderPath}`);
    },
};
exports.default = sessionManager;
