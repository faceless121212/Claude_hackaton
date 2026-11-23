// Creates .env from .env.example if it is missing, then opens it in a text editor so you can paste your key.
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');

const env = path.join(__dirname, '.env');
if (!fs.existsSync(env)) { fs.copyFileSync(path.join(__dirname, '.env.example'), env); console.log('Created .env'); }

const [cmd, args] = process.platform === 'darwin' ? ['open', ['-e', env]]
  : process.platform === 'win32' ? ['notepad', [env]]
  : ['xdg-open', [env]];
console.log(`Opening ${env}\nReplace your-fal-key-here with your key, save the file, then run: npm start`);
const editor = spawn(cmd, args, { stdio: 'ignore', detached: true });
editor.on('error', () => console.log('No editor opened. Open that file yourself in any text editor.'));
editor.unref();
