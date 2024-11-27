import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import { execSync } from 'child_process';
import inquirer from 'inquirer';

// Helper function to check if a directory exists, and create it if it doesn't
export const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(chalk.green(`Directory created at: ${dirPath}`));
  }
};

// Helper function to read and parse a JSON file safely
export const readJsonFile = <T>(filePath: string): T | null => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`Error reading JSON file at ${filePath}: ${error.message}`));
      } else {
        console.error(chalk.red(`Error reading JSON file at ${filePath}: Unknown error`));
      }
      return null;
    }
  };

// Helper function to write an object to a JSON file
export const writeJsonFile = <T>(filePath: string, data: T): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(chalk.green(`Data written to ${filePath}`));
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error writing JSON file at ${filePath}: ${error.message}`));
    } else {
        console.error(chalk.red(`Error writing JSON file at ${filePath}: Unknown error`));
    }
  }
};

// Helper function to execute a shell command and capture the output
export const executeShellCommand = (command: string): string => {
  try {
    console.log(chalk.blue(`Executing command: ${command}`));
    const output = execSync(command, { encoding: 'utf-8' });
    return output;
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error executing command: ${error.message}`));
    } else {
        console.error(chalk.red(`Error executing command: Unknown error`));
    }
    return '';
  }
};

// Helper function to safely execute a command and handle errors
export const executeShellCommandSafe = (command: string): void => {
  try {
    execSync(command, { encoding: 'utf-8' });
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Command failed: ${error.message}`));
    }
    else {
        console.error(chalk.red(`Command failed: Unknown error`));
    }
    process.exit(1);
  }
};

// Helper function to validate if a URL is a valid git repository
export const isValidGitRepo = (repoUrl: string): boolean => {
  const gitRepoRegex = /^https:\/\/(github|gitlab)\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\.git$/;
  return gitRepoRegex.test(repoUrl);
};

// Function to prompt user confirmation (Yes/No)
export const promptUserConfirmation = async (message: string): Promise<boolean> => {
  const { confirmation } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmation',
      message,
      default: false,
    },
  ]);
  return confirmation;
};

// Function to display a welcome message
export const showWelcomeMessage = (): void => {
  console.log(chalk.bold.green('Welcome to Sprungg CLI!'));
  console.log(chalk.green('The tool for managing contributions and repositories.'));
  console.log();
};

// Function to display the help message for the CLI tool
export const showHelpMessage = (): void => {
  console.log(chalk.bold.green('Sprungg CLI Help:'));
  console.log(chalk.green('  --help        Show this help message'));
  console.log(chalk.green('  --start       Start the coding session'));
  console.log(chalk.green('  --status      View the current session status'));
  console.log(chalk.green('  --sync        Sync with the repository'));
  console.log(chalk.green('  --clone       Clone a repository'));
  console.log();
};

// Function to show error message and exit
export const showErrorAndExit = (message: string): void => {
  console.error(chalk.red(message));
  process.exit(1);
};

// Helper function to check if a file or directory exists
export const checkIfExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};

// Helper function to delete a file or directory
export const deleteFileOrDirectory = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmdirSync(filePath, { recursive: true });
      } else {
        fs.unlinkSync(filePath);
      }
      console.log(chalk.green(`Deleted: ${filePath}`));
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error deleting ${filePath}: ${error.message}`));
    } else {
        console.error(chalk.red(`Error deleting ${filePath}: Unknown error`));
    }
  }
};

// Helper function to format the current date in YYYY-MM-DD format
export const getFormattedDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Function to show a success message
export const showSuccessMessage = (message: string): void => {
  console.log(chalk.green(message));
};
