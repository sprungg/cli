import * as fs from "fs";
import * as path from "path";

const configPath = path.join(__dirname, "../config.json");

interface Config {
  token?: string;
  editor?: string;
  repoPaths?: Record<string, string>;
  contributionDetails?: Record<string, any>;
}

const loadConfig = (): Config => {
  if (!fs.existsSync(configPath)) return {};
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
};

const saveConfig = (config: Config): void => {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
};

const config = {
  saveToken(token: string): void {
    const config = loadConfig();
    config.token = token;
    saveConfig(config);
  },

  saveEditor(editor: string): void {
    const config = loadConfig();
    config.editor = editor;
    saveConfig(config);
  },

  getEditor(): string | undefined {
    return loadConfig().editor;
  },

  getRepoPath(repo: string): string | undefined {
    console.log(loadConfig().repoPaths);
    return loadConfig().repoPaths?.[repo];
  },
  // Add a function to save the repo path
  saveRepoPath(repo: string, path: string): void {
    const config = loadConfig();
    if (!config.repoPaths) config.repoPaths = {};
    config.repoPaths[repo] = path;
    saveConfig(config);
  },
  saveContributionDetails(
    contributionId: string,
    details: Record<string, any>
  ): void {
    const config = loadConfig();
    if (!config.contributionDetails) config.contributionDetails = {};
    config.contributionDetails[contributionId] = details;
    saveConfig(config);
  },
  getContributionDetails(
    contributionId: string
  ): Record<string, any> | undefined {
    return loadConfig().contributionDetails?.[contributionId];
  },
};

export default config;
