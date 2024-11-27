#!/usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const auth_1 = __importDefault(require("../src/auth"));
const session_1 = __importDefault(require("../src/session"));
const editor_1 = __importDefault(require("../src/editor"));
const program = new commander_1.Command();
program
    .name('sprungg-cli')
    .description('Sprungg CLI tool for coding workflows')
    .version('1.0.0');
program
    .command('login')
    .description('Authenticate sprungg-cli')
    .action(auth_1.default.login);
program
    .command('start')
    .description('Start a coding session')
    .requiredOption('--contribution-id <id>', 'Contribution ID')
    .requiredOption('--branch <name>', 'Branch name')
    .requiredOption('--repo-url <url>', 'Repository URL')
    .requiredOption('--local-folder-path <path>', 'Local folder path')
    .action((options) => {
    session_1.default.start(options);
});
program
    .command('set-editor <command>')
    .description('Set the preferred editor for sprungg-cli')
    .action(editor_1.default.setEditor);
program
    .command('open-editor')
    .description('Open the preferred editor')
    .requiredOption('--path <repoPath>', 'Path to the repository')
    .action((options) => {
    editor_1.default.openEditor(options);
});
program
    .command('sync')
    .description('Sync the current branch with the remote repository')
    .action(session_1.default.sync);
program.parse(process.argv);
