import config from './config';

const auth = {
  async login(): Promise<void> {
    console.log('Opening browser for authentication...');
    const { execSync } = require('child_process');
    execSync(`open http://localhost:3000/en/login?callbackurl=cli`);

    console.log('Enter the token after completing authentication:');
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question('Token: ', async (token: string) => {
      try {
        // Save the token
        config.saveToken(token);
        console.log('Authentication successful.');
      } catch (error) {
        console.error('Error during authentication:', error);
      } finally {
        readline.close();
      }
    });
  },
};

export default auth;
