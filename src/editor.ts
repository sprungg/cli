import config from './config';
import { execSync } from 'child_process';

const editor = {
  setEditor(command: string): void {
    config.saveEditor(command);
    console.log(`Editor set to: ${command}`);
  },

  async openEditor(options: { path: string }): Promise<void> {
    const editor = config.getEditor();
    if (!editor) {
      console.log('No editor configured. Use "sprungg-cli set-editor <command>" to configure.');
      return;
    }

    console.log(`Launching editor: ${editor}`);
    // find the local path mapped to the repo from the config
    const localPath = config.getRepoPath(options.path);
    execSync(`${editor} ${localPath}`, { stdio: 'inherit' });
  },
};

export default editor;
