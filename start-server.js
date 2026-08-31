const { spawn } = require('child_process');
const path = require('path');
const p = spawn('node', [path.join(__dirname, 'server.js')], { stdio: 'inherit', env: Object.assign({}, process.env, { PORT: process.env.PORT || '3230' }) });
p.on('exit', c => process.exit(c));
process.on('SIGINT', () => p.kill('SIGINT'));