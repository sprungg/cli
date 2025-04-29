import express from "express";
import { Server, WebSocket } from "ws";
import * as http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import { execSync } from "child_process";
import session from "./session";
import git from "./git";
import chokidar from "chokidar";
import config from "./config";
import inquirer from "inquirer";
import chalk from "chalk";
import sessionManager from "./session";
import { existsSync } from "fs";

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

// Store active watchers
const activeWatchers: Map<string, chokidar.FSWatcher> = new Map();
// Store WebSocket connections by contributionId
const wsConnections: Map<string, Set<WebSocket>> = new Map();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(bodyParser.json());

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

const launch = async (contributionId: string) => {
  const repoUrl = config.getContributionDetails(contributionId)?.repoUrl;
  const repoPath = config.getRepoPath(repoUrl);
  const sourceBranch =
    config.getContributionDetails(contributionId)?.sourceBranch;
  let editorCommand = sessionManager.detectEditor();
  if (!editorCommand) {
    console.log(chalk.yellow("No default editor found."));
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "editorCommand",
        message: "Enter the command to open your preferred code editor:",
      },
    ]);
    editorCommand = answers.editorCommand;
  }
  if (!editorCommand) {
    throw new Error("No editor command found");
  }
  console.log(chalk.green(`Opening ${repoPath} in ${editorCommand}`));
  repoPath && git.checkoutBranch(repoPath, sourceBranch);
  execSync(`${editorCommand} ${repoPath}`);
};

// Store contribution details
app.post("/connect", async (req, res) => {
  try {
    const {
      contributionId,
      repoUrl,
      sourceBranch,
      destinationBranch,
      shouldLaunch,
    } = req.body;
    config.saveContributionDetails(contributionId, {
      repoUrl,
      sourceBranch,
      destinationBranch,
    });
    if (!config.getRepoPath(repoUrl)) {
      console.log(
        chalk.yellow(
          "No repository path found. Have you cloned the repository?"
        )
      );

      const hasCloned = await inquirer.prompt([
        {
          type: "confirm",
          name: "hasCloned",
          message: "Have you cloned the repository yet?",
        },
      ]);

      if (hasCloned) {
        const repoPath = await inquirer.prompt([
          {
            type: "input",
            name: "repoPath",
            message: "Enter the path to the repository:",
          },
        ]);
        console.log(
          chalk.green(
            `Saving repository path for ${repoUrl} to ${repoPath.repoPath}`
          )
        );
        config.saveRepoPath(repoUrl, repoPath.repoPath);
      } else {
        const destinationPath = await inquirer.prompt([
          {
            type: "input",
            name: "destinationPath",
            message:
              "Enter the path to the destination folder (including the repo folder):",
          },
        ]);

        // Ensure the destination path is a valid directory
        if (!existsSync(destinationPath)) {
          throw new Error("Destination path is not a valid directory");
        }
        execSync(`git clone ${repoUrl} ${destinationPath}`);
        console.log(
          chalk.green(`Repository cloned successfully to ${destinationPath}`)
        );
        config.saveRepoPath(repoUrl, destinationPath);
      }
    }
    const repoPath = config.getRepoPath(repoUrl);
    if (!repoPath) {
      throw new Error("No repository path found");
    }
    const branchesValid = await git.branchesValid(
      repoPath,
      sourceBranch,
      destinationBranch
    );

    try {
      if (shouldLaunch) launch(contributionId);
    } catch (error) {
      console.log(chalk.red("Failed to launch"));
    }
    res.json({ success: true, branchesValid });
  } catch (error) {
    res.status(500).json({ error: "Failed to store contribution details" });
  }
});

app.post("/launch/:contributionId", async (req, res) => {
  try {
    const { contributionId } = req.params;
    await launch(contributionId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to launch" });
  }
});

// Get git diff
app.get("/diff/:contributionId", async (req, res) => {
  try {
    const { contributionId } = req.params;
    const contributionDetails = config.getContributionDetails(contributionId);
    if (!contributionDetails) {
      return res.status(404).json({ error: "No contribution details found" });
    }
    const repoUrl = contributionDetails.repoUrl;
    const repoPath = config.getRepoPath(repoUrl);

    if (!repoPath || !existsSync(repoPath)) {
      return res.status(404).json({ error: "No repository path found" });
    }
    const sourceBranch = contributionDetails.sourceBranch;
    const destinationBranch = contributionDetails.destinationBranch;

    // Verify both branches exist
    const branchesValid = await git.branchesValid(
      repoPath,
      sourceBranch,
      destinationBranch,
      true
    );
    if (!branchesValid) {
      return res.status(404).json({ error: "One or both branches not found" });
    }

    // Get the diff between the local branches
    const currentBranch = await git.checkCurrentBranch(repoPath);
    const diff =
      currentBranch === sourceBranch
        ? await git.getDiff(repoPath, destinationBranch)
        : await git.getBranchDiff(repoPath, sourceBranch, destinationBranch);

    res.json({ data: diff });
  } catch (error) {
    res.status(500).json({
      error: "Failed to get diff",
      details: (error as Error).message,
    });
  }
});

// Sync branch
app.post("/sync/:contributionId", async (req, res) => {
  try {
    const { contributionId } = req.params;
    const repoUrl = config.getContributionDetails(contributionId)?.repoUrl;
    if (!repoUrl) {
      throw new Error("No repository URL found");
    }
    const repoPath = config.getRepoPath(repoUrl);
    if (!repoPath) {
      throw new Error("No repository path found");
    }
    const branchName =
      config.getContributionDetails(contributionId)?.branchName;
    if (!branchName) {
      throw new Error("No branch name found");
    }

    await git.checkoutBranch(repoPath, branchName);
    execSync("git fetch", { stdio: "inherit" });
    execSync("git pull origin main", { stdio: "inherit" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to sync branch" });
  }
});

// Commit and push changes
app.post("/push/:contributionId", async (req, res) => {
  try {
    const { contributionId } = req.params;
    const { message } = req.body;
    const repoUrl = config.getContributionDetails(contributionId)?.repoUrl;
    if (!repoUrl) {
      throw new Error("No repository URL found");
    }
    const repoPath = config.getRepoPath(repoUrl);
    if (!repoPath) {
      throw new Error("No repository path found");
    }
    const branchName =
      config.getContributionDetails(contributionId)?.branchName;
    if (!branchName) {
      throw new Error("No branch name found");
    }
    await git.commitChanges(repoPath, message, branchName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to push changes" });
  }
});

// Watch changes
wss.on("connection", (ws: WebSocket) => {
  ws.on("message", (message: string) => {
    const data = JSON.parse(message.toString());

    if (data.type === "watch") {
      const { contributionId } = data;
      const sessionData = session.initializeSession();

      if (!sessionData.localFolderPath) {
        ws.send(JSON.stringify({ error: "No local folder path found" }));
        return;
      }

      // Add connection to the map
      if (!wsConnections.has(contributionId)) {
        wsConnections.set(contributionId, new Set());
      }
      wsConnections.get(contributionId)?.add(ws);

      // Create watcher if it doesn't exist
      if (!activeWatchers.has(contributionId)) {
        const watcher = chokidar.watch(sessionData.localFolderPath, {
          ignored: /(^|[\/\\])\../, // ignore dotfiles
          persistent: true,
        });

        watcher.on("all", (event, path) => {
          const connections = wsConnections.get(contributionId);
          if (connections) {
            const message = JSON.stringify({
              type: "fileChange",
              event,
              path: path.replace(sessionData.localFolderPath!, ""),
            });
            connections.forEach((conn) => conn.send(message));
          }
        });

        activeWatchers.set(contributionId, watcher);
      }
    }
  });

  ws.on("close", () => {
    // Remove connection from all contribution sets
    wsConnections.forEach((connections, contributionId) => {
      connections.delete(ws);
      if (connections.size === 0) {
        // Stop watching if no connections left for this contribution
        const watcher = activeWatchers.get(contributionId);
        if (watcher) {
          watcher.close();
          activeWatchers.delete(contributionId);
        }
        wsConnections.delete(contributionId);
      }
    });
  });
});

function startServer(port: number = 3040): void {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default startServer;
