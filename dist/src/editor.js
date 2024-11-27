"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const child_process_1 = require("child_process");
const editor = {
    setEditor(command) {
        config_1.default.saveEditor(command);
        console.log(`Editor set to: ${command}`);
    },
    async openEditor(options) {
        const editor = config_1.default.getEditor();
        if (!editor) {
            console.log('No editor configured. Use "sprungg-cli set-editor <command>" to configure.');
            return;
        }
        console.log(`Launching editor: ${editor}`);
        // find the local path mapped to the repo from the config
        const localPath = config_1.default.getRepoPath(options.path);
        (0, child_process_1.execSync)(`${editor} ${localPath}`, { stdio: 'inherit' });
    },
};
exports.default = editor;
