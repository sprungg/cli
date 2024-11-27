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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const configPath = path.join(__dirname, '../config.json');
const loadConfig = () => {
    if (!fs.existsSync(configPath))
        return {};
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
};
const saveConfig = (config) => {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
};
const config = {
    saveToken(token) {
        const config = loadConfig();
        config.token = token;
        saveConfig(config);
    },
    saveEditor(editor) {
        const config = loadConfig();
        config.editor = editor;
        saveConfig(config);
    },
    getEditor() {
        return loadConfig().editor;
    },
    getRepoPath(repo) {
        return loadConfig().repoPaths?.[repo];
    },
    // Add a function to save the repo path
    saveRepoPath(repo, path) {
        const config = loadConfig();
        if (!config.repoPaths)
            config.repoPaths = {};
        config.repoPaths[repo] = path;
        saveConfig(config);
    },
};
exports.default = config;
