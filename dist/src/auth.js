"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const auth = {
    async login() {
        console.log('Opening browser for authentication...');
        const { execSync } = require('child_process');
        execSync(`open http://localhost:3000/en/login?callbackurl=cli`);
        console.log('Enter the token after completing authentication:');
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        readline.question('Token: ', async (token) => {
            try {
                // Save the token
                config_1.default.saveToken(token);
                console.log('Authentication successful.');
            }
            catch (error) {
                console.error('Error during authentication:', error);
            }
            finally {
                readline.close();
            }
        });
    },
};
exports.default = auth;
