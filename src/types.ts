// Represents the configuration for a Git repository
export interface RepoConfig {
    // The URL of the Git repository (e.g., https://github.com/user/repo.git)
    url: string;
    // The local path where the repository is cloned
    localPath: string;
    // The branch currently being worked on
    branch: string;
    // The contribution ID associated with this repository, if any
    contributionId?: string;
  }
  
  // Represents a user's settings for their code editor preference
  export interface UserSettings {
    // The preferred code editor (e.g., 'vscode', 'sublime', etc.)
    editor: string;
    // The path to the user's editor command, if specified
    editorPath?: string;
    // Whether to prompt the user if no editor is detected
    promptForEditor?: boolean;
  }
  
  // Represents the details of a session (e.g., current contribution, repo)
  export interface Session {
    // The active Git repository configuration
    repoConfig: RepoConfig;
    // The user's editor settings
    userSettings: UserSettings;
    // The time the session started
    startTime: string;
    // The status of the current session (e.g., 'active', 'paused', 'completed')
    status: 'active' | 'paused' | 'completed';
  }
  
  // Represents the status of a Git operation (clone, sync, etc.)
  export interface GitOperationStatus {
    // The name of the operation being performed (e.g., 'clone', 'sync')
    operation: string;
    // The current status of the operation (e.g., 'in-progress', 'completed', 'failed')
    status: 'in-progress' | 'completed' | 'failed';
    // Any message related to the status (e.g., error or success message)
    message: string;
  }
  
  // Represents the metadata for a contribution (could be tied to issues, pull requests, etc.)
  export interface ContributionMetadata {
    // Unique ID for the contribution
    contributionId: string;
    // The description or title of the contribution
    description: string;
    // The GitHub (or other Git platform) URL for the contribution
    contributionUrl: string;
    // The associated branch name for this contribution
    branchName: string;
    // The repository URL where this contribution is made
    repoUrl: string;
    // The status of the contribution (e.g., 'open', 'closed', 'merged')
    status: 'open' | 'closed' | 'merged';
  }
  
  // Represents the details for configuring a user's local environment (e.g., editor, repository)
  export interface LocalConfig {
    // The directory path for storing configuration files (e.g., user preferences)
    configDir: string;
    // The file path where the repository configuration is saved
    repoConfigPath: string;
    // The file path where the user settings (editor preferences) are stored
    userSettingsPath: string;
  }
  