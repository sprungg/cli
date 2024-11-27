# Sprungg CLI

`sprungg-cli` is a command-line interface tool designed to enhance collaboration between developers and streamline workflows. It enables users to manage contributions, repositories, and code editors directly from their terminal.

---

## Features

- **Authentication and Authorization**: Secure authentication to ensure only authorized users can use the tool.
- **Repository Management**: Set up and map repositories securely and efficiently.
- **Editor Detection**: Automatically detects installed code editors or allows manual configuration.
- **Session Management**: Save and restore session data for continuity.
- **Contribution Workflow**: Seamlessly manage contributions, including stashing changes and launching the preferred code editor.
- **File Watching**: Monitor local repository changes in real-time.
- **Status Updates**: Display progress for operations like cloning and syncing.

---

## Installation

### macOS (Homebrew)
```bash
brew install sprungg/sprungg-cli/sprungg-cli
```

### Linux (APT/YUM)
For Debian-based systems:
```bash
sudo apt update
sudo apt install sprungg-cli
```

For RPM-based systems:
```bash
sudo yum install sprungg-cli
```

### Windows
1. Download the installer from the [Releases](https://github.com/olatunde85/sprungg-cli/releases) page.
2. Run the installer and follow the instructions.
3. Alternatively, install via `choco`:
   ```bash
   choco install sprungg-cli
   ```

### Node.js (via npm)
```bash
npm install -g sprungg-cli
```

---

## Usage

### Getting Started
Run the following command to see the available options:
```bash
sprungg-cli --help
```

### Authenticate
```bash
sprungg-cli login
```

### Set Contribution Details
```bash
sprungg-cli contribution
```

### Launch Code Editor
```bash
sprungg-cli edit
```

### Watch Files
```bash
sprungg-cli watch
```

### Example Workflow
1. Authenticate:
   ```bash
   sprungg-cli login
   ```
2. Set your contribution details:
   ```bash
   sprungg-cli contribution
   ```
3. Open your code editor:
   ```bash
   sprungg-cli edit
   ```
4. Start coding and make changes.
5. Monitor file changes:
   ```bash
   sprungg-cli watch
   ```

---

## Configuration

`sprungg-cli` stores session data and configuration in a `.session.json` file located in its installation directory. It includes:

- `contributionId`
- `branchName`
- `repoUrl`
- `editorCommand`
- `isAuthenticated`

---

## Development

Clone the repository and install dependencies:
```bash
git clone https://github.com/olatunde85/sprungg-cli.git
cd sprungg-cli
npm install
```

Run the CLI locally with `ts-node`:
```bash
npx ts-node bin/sprungg-cli.ts --help
```

Login
```bash
npx ts-node bin/sprungg-cli.ts login
```
sprungg-cli tries to detect the default editor(and command), but you can set an editor with the following command
```bash
npx ts-node bin/sprungg-cli.ts set-editor code
```

Start a coding session
```bash
npx ts-node bin/sprungg-cli.ts start --contribution-id aaaaabc --branch main --repo-url 'https://github.com/sprungg/cli' --local-folder-path /Users/Joshua/sprungg/cli
```

You can open an editor if a repository has already been mapped to a local path
```bash
npx ts-node bin/sprungg-cli.ts open-editor --path https://github.com/sprungg/cli
```

Build the project:
```bash
npm run build
```

Run tests:
```bash
npm test
```

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests. See the [Contributing Guide](CONTRIBUTING.md) for more details.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Support

For help or questions, please contact us at [support@sprungg.com](mailto:support@sprungg.com) or open an issue on [GitHub](https://github.com/olatunde85/sprungg-cli/issues).

---
