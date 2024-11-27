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
exports.showSuccessMessage = exports.getFormattedDate = exports.deleteFileOrDirectory = exports.checkIfExists = exports.showErrorAndExit = exports.showHelpMessage = exports.showWelcomeMessage = exports.promptUserConfirmation = exports.isValidGitRepo = exports.executeShellCommandSafe = exports.executeShellCommand = exports.writeJsonFile = exports.readJsonFile = exports.ensureDirectoryExists = void 0;
const fs = __importStar(require("fs"));
const chalk = __importStar(require("chalk"));
const child_process_1 = require("child_process");
const inquirer_1 = __importDefault(require("inquirer"));
// Helper function to check if a directory exists, and create it if it doesn't
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(chalk.green(`Directory created at: ${dirPath}`));
    }
};
exports.ensureDirectoryExists = ensureDirectoryExists;
// Helper function to read and parse a JSON file safely
const readJsonFile = (filePath) => {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(chalk.red(`Error reading JSON file at ${filePath}: ${error.message}`));
        }
        else {
            console.error(chalk.red(`Error reading JSON file at ${filePath}: Unknown error`));
        }
        return null;
    }
};
exports.readJsonFile = readJsonFile;
// Helper function to write an object to a JSON file
const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(chalk.green(`Data written to ${filePath}`));
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(chalk.red(`Error writing JSON file at ${filePath}: ${error.message}`));
        }
        else {
            console.error(chalk.red(`Error writing JSON file at ${filePath}: Unknown error`));
        }
    }
};
exports.writeJsonFile = writeJsonFile;
// Helper function to execute a shell command and capture the output
const executeShellCommand = (command) => {
    try {
        console.log(chalk.blue(`Executing command: ${command}`));
        const output = (0, child_process_1.execSync)(command, { encoding: 'utf-8' });
        return output;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(chalk.red(`Error executing command: ${error.message}`));
        }
        else {
            console.error(chalk.red(`Error executing command: Unknown error`));
        }
        return '';
    }
};
exports.executeShellCommand = executeShellCommand;
// Helper function to safely execute a command and handle errors
const executeShellCommandSafe = (command) => {
    try {
        (0, child_process_1.execSync)(command, { encoding: 'utf-8' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(chalk.red(`Command failed: ${error.message}`));
        }
        else {
            console.error(chalk.red(`Command failed: Unknown error`));
        }
        process.exit(1);
    }
};
exports.executeShellCommandSafe = executeShellCommandSafe;
// Helper function to validate if a URL is a valid git repository
const isValidGitRepo = (repoUrl) => {
    const gitRepoRegex = /^https:\/\/(github|gitlab)\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\.git$/;
    return gitRepoRegex.test(repoUrl);
};
exports.isValidGitRepo = isValidGitRepo;
// Function to prompt user confirmation (Yes/No)
const promptUserConfirmation = async (message) => {
    const { confirmation } = await inquirer_1.default.prompt([
        {
            type: 'confirm',
            name: 'confirmation',
            message,
            default: false,
        },
    ]);
    return confirmation;
};
exports.promptUserConfirmation = promptUserConfirmation;
// Function to display a welcome message
const showWelcomeMessage = () => {
    console.log(chalk.bold.green('Welcome to Sprungg CLI!'));
    console.log(chalk.green('The tool for managing contributions and repositories.'));
    console.log();
};
exports.showWelcomeMessage = showWelcomeMessage;
// Function to display the help message for the CLI tool
const showHelpMessage = () => {
    console.log(chalk.bold.green('Sprungg CLI Help:'));
    console.log(chalk.green('  --help        Show this help message'));
    console.log(chalk.green('  --start       Start the coding session'));
    console.log(chalk.green('  --status      View the current session status'));
    console.log(chalk.green('  --sync        Sync with the repository'));
    console.log(chalk.green('  --clone       Clone a repository'));
    console.log();
};
exports.showHelpMessage = showHelpMessage;
// Function to show error message and exit
const showErrorAndExit = (message) => {
    console.error(chalk.red(message));
    process.exit(1);
};
exports.showErrorAndExit = showErrorAndExit;
// Helper function to check if a file or directory exists
const checkIfExists = (filePath) => {
    return fs.existsSync(filePath);
};
exports.checkIfExists = checkIfExists;
// Helper function to delete a file or directory
const deleteFileOrDirectory = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            if (fs.lstatSync(filePath).isDirectory()) {
                fs.rmdirSync(filePath, { recursive: true });
            }
            else {
                fs.unlinkSync(filePath);
            }
            console.log(chalk.green(`Deleted: ${filePath}`));
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(chalk.red(`Error deleting ${filePath}: ${error.message}`));
        }
        else {
            console.error(chalk.red(`Error deleting ${filePath}: Unknown error`));
        }
    }
};
exports.deleteFileOrDirectory = deleteFileOrDirectory;
// Helper function to format the current date in YYYY-MM-DD format
const getFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};
exports.getFormattedDate = getFormattedDate;
// Function to show a success message
const showSuccessMessage = (message) => {
    console.log(chalk.green(message));
};
exports.showSuccessMessage = showSuccessMessage;
