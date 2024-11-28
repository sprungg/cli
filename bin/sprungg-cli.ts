#!/usr/bin/env ts-node

import { Command } from 'commander';
import auth from '../src/auth';
import session from '../src/session';
import editor from '../src/editor';
import config from '../src/config';

const program = new Command();

program
  .name('sprungg-cli')
  .description('Sprungg CLI tool for coding workflows')
  .version('1.0.0');

program
  .command('login')
  .description('Authenticate sprungg-cli')
  .action(auth.login);

  program
  .command('start')
  .description('Start a coding session')
  .requiredOption('--contribution-id <id>', 'Contribution ID')
  .requiredOption('--branch-name <name>', 'Branch name')
  .requiredOption('--repo-url <url>', 'Repository URL')
  .requiredOption('--local-folder-path <path>', 'Local folder path')
  .action((options) => {
    session.start(options);
  });

program
  .command('set-editor <command>')
  .description('Set the preferred editor for sprungg-cli')
  .action(editor.setEditor);

program
  .command('open-editor')
  .description('Open the preferred editor')
  .requiredOption('--path <repoPath>', 'Path to the repository')
  .action((options) => {
    editor.openEditor(options);
  });

program
  .command('sync')
  .description('Sync the current branch with the remote repository')
  .action(session.sync);

program
  .command('push')
  .description('Push changes to the remote repository')
  .requiredOption('--message <message>', 'Commit message')
  .action((options) => {
    session.push(options);
  });

program.parse(process.argv);
