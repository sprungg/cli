import { WebSocketServer } from 'ws';
import { randomBytes } from 'crypto';
import * as net from 'net';
import * as http from 'http';
import config from './config';
import { exec } from 'child_process';

interface WebSocketSession {
  wsToken: string;
  wsPort: number;
  contributionId: string;
}

const activeSessions: Map<string, WebSocketSession> = new Map();
const DISCOVERY_PORT = 45678; // Fixed port for service discovery

// Create discovery server
const discoveryServer = http.createServer((req, res) => {
  if (req.url?.startsWith('/discover/')) {
    const contributionId = req.url.split('/')[2];
    const session = activeSessions.get(contributionId);
    
    if (session) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        port: session.wsPort,
        token: session.wsToken 
      }));
    } else {
      res.writeHead(404);
      res.end();
    }
  }
});

export function startWebSocketServer(contributionId: string): WebSocketSession {
  const wsToken = randomBytes(32).toString('hex');
  const wsPort = getFreePort();
  
  const wss = new WebSocketServer({ 
    port: wsPort,
    verifyClient: ({ req }, cb) => {
      const clientToken = req.headers['x-ws-token'];
      cb(clientToken === wsToken);
    }
  });

  wss.on('connection', (ws) => {
    ws.on('message', async (message: string) => {
      try {
        const { branch } = JSON.parse(message.toString());
        const details = config.getContributionDetails(contributionId);
        const repoPath = config.getRepoPath(details?.repoUrl);
        
        if (!repoPath) {
          ws.send(JSON.stringify({ error: 'Repository path not found' }));
          return;
        }

        exec(`git diff ${branch}`, { cwd: repoPath }, (error, stdout) => {
          if (error) {
            ws.send(JSON.stringify({ error: error.message }));
            return;
          }
          ws.send(JSON.stringify({ type: 'diff', data: stdout }));
        });
      } catch (error) {
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });
  });

  const session = { wsToken, wsPort, contributionId };
  activeSessions.set(contributionId, session);
  
  return session;
}

function getFreePort(): number {
  const server = net.createServer();
  server.listen(0);
  const address = server.address();
  server.close();
  
  if (address && typeof address === 'object') {
    return address.port;
  }
  throw new Error('Could not find free port');
}

// Start discovery server
discoveryServer.listen(DISCOVERY_PORT, () => {
  console.log(`Discovery server running on port ${DISCOVERY_PORT}`);
}); 